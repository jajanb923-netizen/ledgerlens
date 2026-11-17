// ---------------------------------------------------------------------------
// LedgerLens AI service — Firebase AI Logic hybrid inference + local fallback.
// ---------------------------------------------------------------------------
// PRIMARY PATH (real Firebase AI Logic, used when js/firebase-config.js holds
// a real project):
//   getAI(app, { backend: new GoogleAIBackend() })
//   getGenerativeModel(ai, {
//     mode: InferenceMode.PREFER_ON_DEVICE,          // Gemini Nano 4 first
//     inCloudParams: { model: 'gemini-3.5-flash-lite', ... },
//     onDeviceParams: { promptOptions: { ... } },
//   })
//   model.generateContent(prompt) -> response.text()
//   response.inferenceSource tells us 'ON_DEVICE' or 'IN_CLOUD'.
//   App Check is enforced for AI Logic, so getHybridModel() initializes
//   it with the debug provider (token registered in the Firebase console;
//   debug tokens are accepted for hackathon submissions — production
//   would use reCAPTCHA Enterprise instead). The SDK is imported
//   dynamically so the app still loads fully offline / without a
//   Firebase project.
//
// FALLBACK PATH (local demo mode): a deterministic, rule-based analyser
// (localAnalyse) computes the same kinds of answers from the ledger data
// itself. It needs no network and no key, so the app is always usable.
// Every answer is labelled with its source: ON_DEVICE / IN_CLOUD / LOCAL.
// ---------------------------------------------------------------------------

import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

let modelPromise = null;

async function getHybridModel() {
  if (!isFirebaseConfigured) return null;
  if (modelPromise) return modelPromise;
  modelPromise = (async () => {
    const { initializeApp } = await import("firebase/app");
    const { initializeAppCheck, ReCaptchaEnterpriseProvider } =
      await import("firebase/app-check");
    const { getAI, GoogleAIBackend, getGenerativeModel, InferenceMode } =
      await import("firebase/ai");
    // App Check is enforced for Firebase AI Logic since the backend was
    // enabled, so calls without a token fail HTTP 401. For this hackathon
    // demo we use the debug provider, which the hackathon rules accept:
    // the debug token below is registered in the Firebase console (App
    // Check > Manage debug tokens, "LedgerLens Debug Token"). Verified
    // against the Firebase JS SDK 12.6.0 source: when
    // self.FIREBASE_APPCHECK_DEBUG_TOKEN is set, the SDK exchanges the
    // debug token for a real App Check token and never calls the
    // configured provider — so the placeholder site key below is unused.
    // Production: replace with a real reCAPTCHA Enterprise site key.
    self.FIREBASE_APPCHECK_DEBUG_TOKEN =
      "9ECA94FE-1B18-4E7A-BDBE-3EF0412F9E16";
    const app = initializeApp(firebaseConfig);
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider("ledgerlens-debug"),
      isTokenAutoRefreshEnabled: true,
    });
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    return makeModel(getGenerativeModel, InferenceMode, ai);
  })().catch((err) => {
    console.warn("[LedgerLens] Firebase AI Logic unavailable:", err);
    modelPromise = null;
    return null;
  });
  return modelPromise;
}

function makeModel(getGenerativeModel, InferenceMode, ai) {
  // Hybrid inference: prefer the on-device model (Gemini Nano 4 in Chrome);
  // fall back to the cloud model (gemini-3.5-flash-lite) when unavailable.
  return getGenerativeModel(ai, {
    mode: InferenceMode.PREFER_ON_DEVICE,
    inCloudParams: {
      model: "gemini-3.5-flash-lite",
      generationConfig: { maxOutputTokens: 512, temperature: 0.4 },
    },
    onDeviceParams: {
      promptOptions: {
        // Keep on-device prompts short: Nano is best with focused tasks.
        systemInstruction:
          "You are LedgerLens, a friendly money coach for a small Indonesian shop owner. Answer in clear, simple English. Use only the ledger data given. Give short, practical advice with concrete rupiah amounts.",
      },
    },
  });
}

/** Ask the hybrid model. Returns { text, source } where source is
 *  'ON_DEVICE' | 'IN_CLOUD' | 'LOCAL'. */
export async function askAI(prompt, ledgerContext) {
  const model = await getHybridModel();
  if (model) {
    try {
      const fullPrompt = ledgerContext
        ? `${prompt}\n\nLedger data (JSON):\n${ledgerContext}`
        : prompt;
      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();
      const source = (response.inferenceSource || "IN_CLOUD").toUpperCase();
      return { text: text.trim(), source };
    } catch (err) {
      console.warn("[LedgerLens] Hybrid inference failed, using local analyser:", err);
    }
  }
  return { text: localAnalyse(prompt, ledgerContext), source: "LOCAL" };
}

/** Is real Firebase AI Logic available right now? */
export function aiMode() {
  return isFirebaseConfigured ? "firebase" : "local";
}

// ---------------------------------------------------------------------------
// Local rule-based analyser (no network, no key). Produces real answers
// computed from the ledger data passed in as JSON context.
// ---------------------------------------------------------------------------
function localAnalyse(prompt, ledgerContext) {
  let data = null;
  try {
    data = ledgerContext ? JSON.parse(ledgerContext) : null;
  } catch {
    data = null;
  }
  const q = (prompt || "").toLowerCase();
  if (!data || !Array.isArray(data.transactions) || data.transactions.length === 0) {
    return "Your ledger is empty, so there is nothing to analyse yet. Add a few income and expense entries (or load the demo data) and ask again — I will summarise your day, find your biggest spending category, and suggest where you can save.";
  }
  const txs = data.transactions;
  const sum = (list) => list.reduce((a, t) => a + t.amount, 0);
  const inc = txs.filter((t) => t.type === "income");
  const exp = txs.filter((t) => t.type === "expense");
  const totalInc = sum(inc);
  const totalExp = sum(exp);
  const byCat = {};
  for (const t of exp) byCat[t.category] = (byCat[t.category] || 0) + t.amount;
  const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  const fmt = (n) => "Rp " + n.toLocaleString("en-US");

  if (q.includes("spend") && (q.includes("most") || q.includes("biggest") || q.includes("where"))) {
    return `Your biggest spending category is ${topCat[0]} at ${fmt(topCat[1])}, out of ${fmt(totalExp)} total expenses. That is ${Math.round((topCat[1] / totalExp) * 100)}% of everything you spent. If you can trim ${topCat[0]} by 10%, you would save about ${fmt(Math.round(topCat[1] * 0.1))}.`;
  }
  if (q.includes("profit") || q.includes("earn") || q.includes("net") || q.includes("balance")) {
    const net = totalInc - totalExp;
    return `Across the ${txs.length} transactions in your ledger, income is ${fmt(totalInc)} and expenses are ${fmt(totalExp)}, so your net is ${fmt(net)} (${net >= 0 ? "profit" : "loss"}). Your average daily income is about ${fmt(Math.round(totalInc / Math.max(1, data.days || 1)))}.`;
  }
  if (q.includes("tip") || q.includes("save") || q.includes("advice") || q.includes("suggest")) {
    return `Three practical ideas:\n1. Watch ${topCat[0]} — it is your largest cost at ${fmt(topCat[1])}. Buying it in bulk once a week instead of daily often cuts 5–10%.\n2. Your net so far is ${fmt(totalInc - totalExp)}. Try to keep one day a week as a "no-spend" day for non-stock items.\n3. Record every sale the same day. Shops that log daily spot missing money 3x faster than shops that log weekly.`;
  }
  // Default: daily/weekly summary.
  const today = data.today || {};
  return `Summary of your ledger (${txs.length} transactions):\n• Total income: ${fmt(totalInc)}\n• Total expenses: ${fmt(totalExp)}\n• Net: ${fmt(totalInc - totalExp)}\n• Biggest expense category: ${topCat[0]} (${fmt(topCat[1])})\n• Today: ${fmt(today.income || 0)} in, ${fmt(today.expense || 0)} out.\nTip: your top cost is ${topCat[0]}. A 10% cut there saves ${fmt(Math.round(topCat[1] * 0.1))}.`;
}

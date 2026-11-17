# Devpost submission draft — LedgerLens (#BuildHybridAI 2026)

> DRAFT — fill the bracketed fields after the repo is created and the app is
> deployed. All text is in English, as required. Submit at
> https://firebasehybridaihackathon.devpost.com/ before Mon 1 Dec 2026, 05:00 WIB.

## Project title
LedgerLens — Offline-first money ledger for small shops with hybrid AI

## Tagline (short)
Daily money ledger for small shops: AI insights on-device first, cloud when needed.

## Description (Devpost "About the project" / text description)

**The problem.** Millions of small neighbourhood shops (*warung*) in Indonesia
run on paper notebooks or memory. The owner never knows: did I actually make
money today? Where did it all go? Existing bookkeeping apps need accounts,
subscriptions and a stable connection — three things a small shop often does
not have.

**What LedgerLens does.** A free, offline-first web app for daily money
tracking. The owner records income and expenses in seconds, sees today's
income, today's expenses, balance and monthly net at a glance, follows a
14-day income-vs-expenses chart, and sets monthly budgets per category
(stock, rent, utilities, transport…). All data lives in the browser
(localStorage): no account, no server, no cost, and it works with no
internet at all.

**The AI.** Every ledger gets a money coach: a daily insight, a weekly review,
and free-form questions ("Where did I spend the most this week?"). This is
where Firebase AI Logic hybrid inference earns its place:

- **On-device first** — `InferenceMode.PREFER_ON_DEVICE` runs summaries on
  Gemini Nano 4 in Chrome. The ledger never leaves the device: fast, private,
  and free. This is the right default for a shop owner whose financial data is
  sensitive and whose connection is unreliable.
- **Cloud fallback** — when no on-device model is available, the same call
  falls back to `gemini-3.5-flash-lite` in the cloud, so the feature never
  disappears on older devices.
- **Transparency** — every answer carries a badge showing where it was
  computed (*On device · Gemini Nano* / *Cloud · Gemini Flash*), so the user
  always knows.
- **Graceful offline mode** — with no Firebase project configured, a built-in
  local analyser computes the same summaries from the ledger itself, so the
  app is fully usable with zero setup.

**How we used Firebase AI Logic.** `js/ai.js` imports `getAI`,
`GoogleAIBackend`, `getGenerativeModel` and `InferenceMode` from
`firebase/ai`, builds one hybrid model (on-device Nano 4 preferred, cloud
Flash-Lite fallback), and calls `model.generateContent()` with a compact JSON
summary of the ledger. The response text and `response.inferenceSource` are
shown in the UI. App Check is documented in `js/firebase-config.js` (debug
tokens accepted in submissions). No API keys or secrets are in the repository.

**Value proposition.** For a shop owner earning a few hundred thousand rupiah
a day, knowing that stock is 49% of all spending — and that a 10% cut saves
~Rp 100,000 — is the difference between guessing and managing. LedgerLens
gives that answer in one tap, privately, on the cheapest device, with no
monthly fee.

**What I built during the submission period.** The entire app is new: UI,
offline data layer, chart, budgets, CSV export, demo dataset, and the
Firebase AI Logic hybrid integration (on-device + cloud + local fallback).

## Platform
- [x] Web (Chrome)

## Links
- Code repository: https://github.com/jajanb923-netizen/ledgerlens
- Live demo (hosted): [https://jajanb923-netizen.github.io/ledgerlens/ — set after GitHub Pages is enabled]
- Demo video (YouTube, ≤ 3 min): [paste link after upload]

## Testing instructions for judges
1. Open the live demo link (no login, no setup).
2. Click **"Load demo data"** — 3 weeks of realistic shop transactions appear.
3. Click **"✦ Generate daily insight"** and **"✦ Weekly review"** — an AI
   summary appears with a badge showing where it was computed.
4. Try **"Ask about your money"**, e.g. *"Where did I spend the most this week?"*
5. Add a transaction with the form; watch the dashboard, chart and budgets update.
6. Set a monthly budget (e.g. Stock & supplies) and see the progress bar.
7. Click **"Export CSV"** to download the ledger.
8. To see real hybrid inference: paste a Firebase project config into
   `js/firebase-config.js` (free tier, 5-minute setup — instructions in the
   file and README). Without it, the app uses its built-in local analyser and
   every feature still works.

## Built with
Firebase AI Logic (Gemini Nano 4 on-device + Gemini 2.5 Flash-Lite cloud),
Firebase App Check, vanilla JavaScript (ES modules, no framework), HTML, CSS.

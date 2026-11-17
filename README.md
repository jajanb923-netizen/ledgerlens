# LedgerLens — Offline-first money ledger for small shops

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform: Web](https://img.shields.io/badge/Platform-Web%20%2F%20Chrome-blue.svg)](https://firebasehybridaihackathon.devpost.com/)
[![Firebase AI Logic](https://img.shields.io/badge/AI-Firebase%20AI%20Logic%20%7C%20Gemini%20Nano%20%2B%20Flash-orange.svg)](https://firebase.google.com/docs/ai-logic)

**LedgerLens** is a daily money ledger for small neighbourhood shops (*warung* / UMKM) in Indonesia — built for the **#BuildHybridAI 2026** hackathon ($30,000 in cash prizes).

Shop owners record income and expenses in seconds, see their day/week at a glance, set monthly budgets per category — and get **AI insights about their own money**: a daily summary, a weekly review, and free-form questions ("Where did I spend the most this week?").

## Why hybrid AI matters here

Most small-shop owners use cheap Android phones or shared computers, often with slow or no internet. LedgerLens runs its AI **on-device first**:

- **On-device:** Firebase AI Logic with `InferenceMode.PREFER_ON_DEVICE` runs summaries on **Gemini Nano 4** in Chrome — fast, private (the ledger never leaves the browser), and free.
- **Cloud fallback:** when no on-device model is available, the same call falls back to **`gemini-3.5-flash-lite`** in the cloud.
- **Every answer is labelled** with where it was computed — *On device · Gemini Nano*, *Cloud · Gemini Flash*, or *Local analyser* — so the user always knows.

## Features

- Add income / expense transactions (amount in IDR, category, note, date)
- Dashboard: income today, expenses today, all-time balance, net this month
- 14-day income-vs-expenses bar chart (dependency-free canvas)
- Monthly budgets per expense category with progress bars and over-budget warnings
- AI daily insight, weekly review, and ask-anything about your ledger
- Filter + search transactions, delete entries
- Export all data as CSV
- One-click demo dataset (3 weeks of realistic shop transactions)
- **Offline-first:** all data lives in `localStorage`. No account, no server, no cost.

## How the hybrid AI is wired (the important part)

`js/ai.js` is the whole integration — imported and actually called at runtime:

```js
import { getAI, GoogleAIBackend, getGenerativeModel, InferenceMode } from "firebase/ai";

const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, {
  mode: InferenceMode.PREFER_ON_DEVICE,          // Gemini Nano 4 first
  inCloudParams: { model: "gemini-3.5-flash-lite", generationConfig: { maxOutputTokens: 512 } },
  onDeviceParams: { promptOptions: { systemInstruction: "You are LedgerLens, a friendly money coach…" } },
});
const result = await model.generateContent(prompt);
result.response.text();            // the answer
result.response.inferenceSource;   // 'ON_DEVICE' or 'IN_CLOUD'
```

Firebase AI Logic requires App Check; debug tokens are accepted in hackathon submissions (see `js/firebase-config.js` for the setup notes).

## Run it

No build step. Serve the folder over HTTP (ES modules + import map need `http(s)`, not `file://`):

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

or `npm run serve:node`.

## Enable real hybrid AI (free, ~5 minutes)

1. Create a free project at <https://console.firebase.google.com>.
2. Build → AI Logic → Get started. Enable the Gemini Developer API backend (free tier).
3. Build → App Check → register this web app; use the debug provider for testing.
4. Project settings → Your apps → Web app: copy the `firebaseConfig` object into `js/firebase-config.js`, replacing the placeholder values.
5. Reload. The status chip in the header changes from "Local demo mode" to "On-device" / "Cloud" depending on where each answer was computed.

**Without any Firebase project the app still works fully** — a built-in local analyser (`localAnalyse` in `js/ai.js`) computes the same summaries from the ledger data itself, so judges can use every feature with zero setup. No API key or secret is ever committed to this repository.

## Project structure

```
index.html                  App shell + Firebase SDK import map
css/styles.css              All styling (no framework)
js/app.js                   UI wiring
js/store.js                 localStorage data layer, CSV export, AI context builder
js/ai.js                    Firebase AI Logic hybrid inference + local fallback
js/firebase-config.js       Firebase config placeholder + setup instructions
js/charts.js                Dependency-free canvas chart
js/seed.js                  Demo dataset (3 weeks of shop transactions)
manifest.webmanifest        PWA manifest
```

## Hackathon

- Contest: **#BuildHybridAI 2026** — <https://firebasehybridaihackathon.devpost.com/>
- Platform: **Web (Chrome)**
- Submission deadline: **30 Nov 2026, 2:00 PM PT** (1 Dec 2026, 05:00 WIB)
- License: MIT

## License

MIT — see [LICENSE](LICENSE).

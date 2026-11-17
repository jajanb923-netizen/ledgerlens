// ---------------------------------------------------------------------------
// Firebase project configuration for LedgerLens.
// ---------------------------------------------------------------------------
// HOW TO ENABLE REAL HYBRID AI (free tier, ~5 minutes, no payment needed):
//   1. Go to https://console.firebase.google.com and create a free project.
//   2. In the project: Build > AI Logic > Get started. Enable the
//      Gemini Developer API backend and turn on the free tier.
//   3. In the project: Build > App Check > Apps > register this web app and
//      enable the debug provider for local testing (debug tokens are
//      accepted in hackathon submissions). For production use, enable
//      reCAPTCHA Enterprise instead of the debug provider.
//   4. In Project settings > Your apps > Web app, copy the firebaseConfig
//      object and paste it below, replacing the placeholder values.
//   5. Rebuild/redeploy. The app will then call Firebase AI Logic with
//      InferenceMode.PREFER_ON_DEVICE (Gemini Nano 4 on Chrome, falling
//      back to gemini-2.5-flash-lite in the cloud).
//
// Until a real config is pasted here, the app runs in LOCAL DEMO MODE:
// every AI feature still works through a built-in rule-based analyser
// (js/ai.js -> localAnalyse), so the app is fully usable with zero setup.
// No API key or secret is ever committed to this repository.
// ---------------------------------------------------------------------------

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// True when a real Firebase project has been pasted in above.
export const isFirebaseConfigured =
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.projectId !== "YOUR_PROJECT_ID";

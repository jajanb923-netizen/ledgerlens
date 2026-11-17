// ---------------------------------------------------------------------------
// Firebase project configuration for LedgerLens.
// ---------------------------------------------------------------------------
// Project: ledgerlens (ID ledgerlens-adad4), Spark free tier, no billing.
// AI Logic enabled with the Gemini Developer API backend; App Check debug
// provider registered in the Firebase console (debug tokens are accepted
// in hackathon submissions). The values below are Firebase web client
// identifiers — public by design (Firebase docs: they identify the project,
// they are not secret keys). No Gemini API key or other secret is in this
// repository. For production, enable reCAPTCHA Enterprise instead of the
// debug provider (see js/ai.js).
//
// With this config in place the app calls Firebase AI Logic with
// InferenceMode.PREFER_ON_DEVICE (Gemini Nano 4 on Chrome, falling back
// to gemini-2.5-flash-lite in the cloud). Without it, the app runs in
// LOCAL DEMO MODE via the built-in rule-based analyser (js/ai.js).
// ---------------------------------------------------------------------------

export const firebaseConfig = {
  apiKey: "AIzaSyBSvldo4nOxaxc2iQin2w-yPS-bd-nQKeo",
  authDomain: "ledgerlens-adad4.firebaseapp.com",
  projectId: "ledgerlens-adad4",
  storageBucket: "ledgerlens-adad4.firebasestorage.app",
  messagingSenderId: "403335430873",
  appId: "1:403335430873:web:37f9417201aa8418aff4c8",
};

// True when a real Firebase project has been pasted in above.
export const isFirebaseConfigured =
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.projectId !== "YOUR_PROJECT_ID";

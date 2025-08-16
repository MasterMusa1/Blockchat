import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// You can get this from your Firebase project console:
// 1. Go to https://console.firebase.google.com/
// 2. Select your project.
// 3. Go to Project Settings (the gear icon in the top left).
// 4. In the "General" tab, scroll down to "Your apps".
// 5. Find your web app and copy the `firebaseConfig` object.
const firebaseConfig = {
  apiKey: "AIzaSyB...YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db };
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// TODO: Replace the following with your app's Firebase project configuration
// See instructions in the chat on how to get these keys.
const firebaseConfig = {
    apiKey: "AIzaSyBi_aQeMoHzUpDKiMJpJmDbgB9-MuDcmmM",
    authDomain: "rhetoric-rumble.firebaseapp.com",
    projectId: "rhetoric-rumble",
    storageBucket: "rhetoric-rumble.firebasestorage.app",
    messagingSenderId: "307279368218",
    appId: "1:307279368218:web:9ab42ed1d546e7a2fb01a3",
    measurementId: "G-QTCV33FC5P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

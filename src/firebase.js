import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAeS3m_usl07dtN3L5DePm4N2R1Lyzzk3o",
  authDomain: "seva-setu-9a8e3.firebaseapp.com",
  projectId: "seva-setu-9a8e3",
  storageBucket: "seva-setu-9a8e3.firebasestorage.app",
  messagingSenderId: "64610770589",
  appId: "1:64610770589:web:0eab4e6134eedf50c8fe74",
  measurementId: "G-NL3YNBF8KC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services we'll use throughout the app
export const db = getFirestore(app);          // Firestore database
export const auth = getAuth(app);             // Authentication
export const googleProvider = new GoogleAuthProvider(); // Google login provider
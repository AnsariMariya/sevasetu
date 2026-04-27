// src/context/AuthContext.js
// ─────────────────────────────────────────────────────────
// This is a "context" - think of it as a global store.
// Any component in the app can ask "who is logged in?"
// without passing props everywhere.
// ─────────────────────────────────────────────────────────

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, db } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";

// Create the context (like a shared box of info)
const AuthContext = createContext();

// Custom hook so any component can call: const { user } = useAuth()
export function useAuth() {
  return useContext(AuthContext);
}

// This wraps the whole app and provides auth info to everyone
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // The logged-in user object
  const [loading, setLoading] = useState(true); // Are we still checking auth?

  // ── Google Sign In ──────────────────────────────────────
  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const u = result.user;

    // When someone logs in for the first time, create their profile in Firestore
    const userRef = doc(db, "users", u.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // First time login → create profile
      await setDoc(userRef, {
        name: u.displayName,
        email: u.email,
        photoURL: u.photoURL,
        helpsCompleted: 0,       // Track how many people they've helped
        trustScore: 100,         // Start everyone with a base trust score
        joinedAt: new Date(),
        role: "user"             // Could be "ngo" in future
      });
    }
  }

  // ── Sign Out ────────────────────────────────────────────
  async function logout() {
    await signOut(auth);
  }

  // ── Increment Help Count (called when someone completes a help) ──
  async function incrementHelpsCompleted(userId) {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      helpsCompleted: increment(1),
      trustScore: increment(5) // Each completed help adds 5 trust points
    });
  }

  // ── Listen for auth state changes ──────────────────────
  // Firebase automatically tells us when someone logs in/out
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch their Firestore profile to get helpsCompleted etc.
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        const profileData = userSnap.exists() ? userSnap.data() : {};
        setUser({ ...firebaseUser, ...profileData });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup listener when component unmounts
  }, []);

  // Everything we share with the rest of the app
  const value = { user, loading, loginWithGoogle, logout, incrementHelpsCompleted };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
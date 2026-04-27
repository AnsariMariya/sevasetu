// src/components/ProtectedRoute.js
// ─────────────────────────────────────────────────────────
// Wraps routes that require login.
// If not logged in → redirect to /login
// ─────────────────────────────────────────────────────────

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
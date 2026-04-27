import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Layout
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Requests from "./pages/Requests";
import PostRequest from "./pages/PostRequest";
import Profile from "./pages/Profile";
import Login from "./pages/Login";

// Global styles
import "./styles/global.css";

export default function App() {
  return (
    // AuthProvider wraps everything so all components can access user info
    <AuthProvider>
      <Router>
        {/* Navbar is always visible */}
        <Navbar />

        {/* Page content */}
        <main>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/login" element={<Login />} />

            {/* Protected routes - requires login */}
            <Route
              path="/post"
              element={
                <ProtectedRoute>
                  <PostRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Catch-all: redirect unknown URLs to home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}
// src/components/Navbar.js
// ─────────────────────────────────────────────────────────
// Top navigation bar with logo, nav links, and user avatar
// ─────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Helper to check if a nav link is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        
        {/* ── Logo ── */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🤝</span>
          <span className="logo-text">Seva<span>Setu</span></span>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
            Home
          </Link>
          <Link to="/requests" className={`nav-link ${isActive("/requests") ? "active" : ""}`}>
            Requests
          </Link>
          {user && (
            <Link to="/post" className={`nav-link nav-link-cta ${isActive("/post") ? "active" : ""}`}>
              + Ask for Help
            </Link>
          )}
        </div>

        {/* ── User Section ── */}
        <div className="navbar-user">
          {user ? (
            <div className="user-menu">
              <Link to="/profile" className="user-avatar-btn" title="View profile">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder">{user.displayName?.[0]}</div>
                )}
              </Link>
              <button onClick={logout} className="btn btn-outline btn-sm">
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Sign in
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {/* ── Mobile Dropdown ── */}
      {menuOpen && (
        <div className="mobile-menu" onClick={() => setMenuOpen(false)}>
          <Link to="/" className="mobile-link">Home</Link>
          <Link to="/requests" className="mobile-link">Requests</Link>
          {user && <Link to="/post" className="mobile-link">+ Ask for Help</Link>}
          {user && <Link to="/profile" className="mobile-link">My Profile</Link>}
          {user && <button onClick={logout} className="mobile-link mobile-link-btn">Sign out</button>}
          {!user && <Link to="/login" className="mobile-link">Sign in</Link>}
        </div>
      )}
    </nav>
  );
}
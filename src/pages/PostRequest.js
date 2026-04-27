// src/pages/PostRequest.js
// ─────────────────────────────────────────────────────────
// Form to post a new help request.
// Saves to Firestore. Shows success feedback.
// ─────────────────────────────────────────────────────────

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import "./PostRequest.css";

const CATEGORIES = ["Food", "Medical", "Emergency", "Education", "Other"];

// ── Smart auto-tag logic ──────────────────────────────────
// If description contains emergency keywords → auto-mark urgent
function smartDetectUrgency(text) {
  const urgentKeywords = [
    "urgent", "emergency", "critical", "dying", "accident",
    "fire", "flood", "immediate", "asap", "bleeding", "unconscious"
  ];
  return urgentKeywords.some((kw) => text.toLowerCase().includes(kw));
}

export default function PostRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    name: user?.displayName || "",
    category: "Food",
    description: "",
    location: "",
    isUrgent: false,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [autoUrgent, setAutoUrgent] = useState(false); // Detected by smart tagging

  // ── Handle input changes ──────────────────────────────────
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const newVal = type === "checkbox" ? checked : value;

    setForm((prev) => ({ ...prev, [name]: newVal }));

    // Smart urgency detection on description field
    if (name === "description") {
      const detected = smartDetectUrgency(value);
      setAutoUrgent(detected);
      if (detected) {
        setForm((prev) => ({ ...prev, description: value, isUrgent: true }));
      }
    }
  }

  // ── Submit to Firestore ───────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;

    // Simple validation
    if (!form.description.trim() || !form.location.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "requests"), {
        ...form,
        status: "open",                    // All requests start as open
        postedById: user.uid,
        postedByName: user.displayName,
        postedByPhoto: user.photoURL,
        postedByTrust: user.trustScore || 100, // Include trust score for display
        createdAt: serverTimestamp(),      // Server timestamp for consistency
        acceptedBy: null,
        acceptedById: null,
      });

      setSubmitted(true);
      // Redirect to requests after 2 seconds
      setTimeout(() => navigate("/requests"), 2000);
    } catch (err) {
      console.error("Error posting request:", err);
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  // ── Success screen ────────────────────────────────────────
  if (submitted) {
    return (
      <div className="post-page">
        <div className="container">
          <div className="success-card card">
            <div className="success-icon">🎉</div>
            <h2>Request posted!</h2>
            <p>Your request is now live. Volunteers can see it and will reach out.</p>
            <p className="success-redirect">Taking you to the dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post-page">
      <div className="container">
        <div className="post-layout">

          {/* ── Form Card ── */}
          <div className="post-form-card card">
            <div className="post-form-header">
              <h1>Ask for Help</h1>
              <p>Your request will be seen by volunteers immediately.</p>
            </div>

            <form onSubmit={handleSubmit} className="post-form">

              {/* Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="name">Your Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Type of Help Needed</label>
                <div className="category-grid">
                  {CATEGORIES.map((cat) => (
                    <label
                      key={cat}
                      className={`category-option ${form.category === cat ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={form.category === cat}
                        onChange={handleChange}
                        hidden
                      />
                      <span className="cat-icon">{getCatIcon(cat)}</span>
                      <span className="cat-label">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label" htmlFor="description">
                  Describe Your Situation
                </label>
                {autoUrgent && (
                  <div className="auto-urgent-notice">
                    🚨 Emergency keywords detected — marked as urgent automatically.
                  </div>
                )}
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Tell us what you need and any important details..."
                  rows={4}
                  required
                />
              </div>

              {/* Location */}
              <div className="form-group">
                <label className="form-label" htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  className="form-input"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Neighbourhood, City (e.g. Dharavi, Mumbai)"
                  required
                />
              </div>

              {/* Urgent Toggle */}
              <div className="urgent-toggle-row">
                <label className="toggle-wrapper" htmlFor="isUrgent">
                  <div className="toggle">
                    <input
                      id="isUrgent"
                      type="checkbox"
                      name="isUrgent"
                      checked={form.isUrgent}
                      onChange={handleChange}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                  <div className="urgent-toggle-text">
                    <span className="urgent-toggle-label">Mark as Urgent</span>
                    <span className="urgent-toggle-hint">Urgent requests are highlighted and shown first</span>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary submit-btn"
                disabled={loading}
              >
                {loading ? "Posting..." : "🤲 Post Request"}
              </button>

            </form>
          </div>

          {/* ── Side Info ── */}
          <div className="post-side">
            <div className="side-card card">
              <h3>🛡️ You're safe here</h3>
              <p>Your request is seen only by verified Google account holders. We do not share your email.</p>
            </div>
            <div className="side-card card">
              <h3>⚡ What happens next?</h3>
              <ol className="side-steps">
                <li>Your request goes live instantly</li>
                <li>Volunteers see it on the dashboard</li>
                <li>Someone accepts and contacts you</li>
                <li>Status updates in real-time</li>
              </ol>
            </div>
            <div className="side-card card tips-card">
              <h3>💡 Tips for faster help</h3>
              <ul>
                <li>Be specific about what you need</li>
                <li>Include your exact location</li>
                <li>Mark urgent only if truly urgent</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Helper ────────────────────────────────────────────────
function getCatIcon(cat) {
  const icons = { Food: "🍛", Medical: "🏥", Emergency: "🚨", Education: "📚", Other: "🤲" };
  return icons[cat] || "🤲";
}
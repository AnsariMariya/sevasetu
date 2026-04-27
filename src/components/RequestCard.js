// src/components/RequestCard.js
// ─────────────────────────────────────────────────────────
// Displays a single help request as a card.
// Shows urgency, category, status, and action buttons.
// ─────────────────────────────────────────────────────────

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import "./RequestCard.css";

// Category metadata: icon + color for each type of help
const CATEGORY_META = {
  Food:      { icon: "🍛", color: "#d97706" },
  Medical:   { icon: "🏥", color: "#dc2626" },
  Emergency: { icon: "🚨", color: "#c0392b" },
  Education: { icon: "📚", color: "#1d4e89" },
  Other:     { icon: "🤲", color: "#6b7280" },
};

export default function RequestCard({ request, onUpdate }) {
  const { user, incrementHelpsCompleted } = useAuth();
  const [loading, setLoading] = useState(false);

  const meta = CATEGORY_META[request.category] || CATEGORY_META["Other"];
  
  // Format the timestamp nicely (e.g. "3 minutes ago")
  const timeAgo = request.createdAt?.toDate
    ? formatDistanceToNow(request.createdAt.toDate(), { addSuffix: true })
    : "just now";

  // ── Accept the request (volunteer clicks "I'll Help") ──
  async function handleAccept() {
    if (!user) return alert("Please sign in first!");
    setLoading(true);
    try {
      await updateDoc(doc(db, "requests", request.id), {
        status: "accepted",
        acceptedBy: user.displayName,
        acceptedById: user.uid,
        acceptedAt: new Date(),
      });
      onUpdate?.(); // Refresh the list
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  // ── Mark as Completed ──
  async function handleComplete() {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "requests", request.id), {
        status: "completed",
        completedAt: new Date(),
      });
      // Give the volunteer credit for completing a help
      if (request.acceptedById) {
        await incrementHelpsCompleted(request.acceptedById);
      }
      onUpdate?.();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  const isOwner = user?.uid === request.postedById;
  const isHelper = user?.uid === request.acceptedById;

  return (
    <div className={`request-card card animate-in ${request.isUrgent ? "urgent-card" : ""}`}>
      
      {/* ── Urgent Banner ── */}
      {request.isUrgent && (
        <div className="urgent-banner">
          🚨 Urgent
        </div>
      )}

      {/* ── Card Header ── */}
      <div className="card-header">
        <div className="category-badge" style={{ background: meta.color + "18", color: meta.color }}>
          {meta.icon} {request.category}
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* ── Main Content ── */}
      <div className="card-body">
        <h3 className="request-name">{request.name}</h3>
        <p className="request-description">{request.description}</p>

        <div className="card-meta">
          <span className="meta-item">
            📍 {request.location}
          </span>
          <span className="meta-item">
            🕐 {timeAgo}
          </span>
        </div>
      </div>

      {/* ── Action Footer ── */}
      <div className="card-footer">
        {/* Trust score visual */}
        {request.postedByTrust && (
          <div className="trust-indicator" title="Poster's trust score">
            <span className="trust-dot"></span>
            Trust {request.postedByTrust}
          </div>
        )}

        <div className="card-actions">
          {/* Open → volunteer can accept */}
          {request.status === "open" && !isOwner && (
            <button
              className="btn btn-primary btn-help"
              onClick={handleAccept}
              disabled={loading}
            >
              {loading ? "..." : "🤝 I'll Help"}
            </button>
          )}

          {/* Accepted → show who's helping */}
          {request.status === "accepted" && (
            <span className="helper-name">
              ✅ {request.acceptedBy} is helping
            </span>
          )}

          {/* The helper or owner can mark complete */}
          {request.status === "accepted" && (isHelper || isOwner) && (
            <button
              className="btn btn-outline btn-complete"
              onClick={handleComplete}
              disabled={loading}
            >
              {loading ? "..." : "Mark Complete"}
            </button>
          )}

          {request.status === "completed" && (
            <span className="completed-text">✨ Help delivered</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Status Badge sub-component ──────────────────────────────
function StatusBadge({ status }) {
  const config = {
    open:      { label: "Open",      className: "badge-open" },
    accepted:  { label: "In Progress", className: "badge-accepted" },
    completed: { label: "Done",      className: "badge-completed" },
  };
  const s = config[status] || config["open"];
  return <span className={`badge ${s.className}`}>{s.label}</span>;
}
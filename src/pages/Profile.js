// src/pages/Profile.js
// ─────────────────────────────────────────────────────────
// User's profile: avatar, stats, their posted requests
// ─────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import RequestCard from "../components/RequestCard";
import "./Profile.css";

export default function Profile() {
  const { user, logout } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch this user's posted requests
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "requests"),
      where("postedById", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMyRequests(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  if (!user) return null;

  // Compute stats from their requests
  const openCount = myRequests.filter((r) => r.status === "open").length;
  const completedCount = myRequests.filter((r) => r.status === "completed").length;

  // Trust score color
  const trustColor =
    user.trustScore >= 150 ? "var(--green)" :
    user.trustScore >= 100 ? "var(--blue)" : "var(--muted)";

  return (
    <div className="profile-page">
      <div className="container">

        {/* ── Profile Header ── */}
        <div className="profile-header card">
          <div className="profile-avatar-wrap">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">{user.displayName?.[0]}</div>
            )}
          </div>

          <div className="profile-info">
            <h1 className="profile-name">{user.displayName}</h1>
            <p className="profile-email">{user.email}</p>
            <div className="profile-trust" style={{ color: trustColor }}>
              🛡️ Trust Score: <strong>{user.trustScore || 100}</strong>
              <span className="trust-explain"> — increases with each completed help</span>
            </div>
          </div>

          <button onClick={logout} className="btn btn-outline profile-logout">
            Sign out
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div className="profile-stats">
          <div className="profile-stat-card card">
            <span className="ps-icon">🤲</span>
            <span className="ps-value">{myRequests.length}</span>
            <span className="ps-label">Requests Posted</span>
          </div>
          <div className="profile-stat-card card">
            <span className="ps-icon">✅</span>
            <span className="ps-value">{user.helpsCompleted || 0}</span>
            <span className="ps-label">Helps Completed</span>
          </div>
          <div className="profile-stat-card card">
            <span className="ps-icon">📋</span>
            <span className="ps-value">{openCount}</span>
            <span className="ps-label">Open Requests</span>
          </div>
          <div className="profile-stat-card card">
            <span className="ps-icon">🌟</span>
            <span className="ps-value">{completedCount}</span>
            <span className="ps-label">Requests Resolved</span>
          </div>
        </div>

        {/* ── My Requests ── */}
        <section className="my-requests-section">
          <h2 className="section-title">My Requests</h2>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : myRequests.length === 0 ? (
            <div className="empty-state">
              <span className="icon">📋</span>
              <h3>No requests yet</h3>
              <p>You haven't posted any help requests. Post one when you need support.</p>
            </div>
          ) : (
            <div className="requests-grid">
              {myRequests.map((req) => (
                <RequestCard key={req.id} request={req} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
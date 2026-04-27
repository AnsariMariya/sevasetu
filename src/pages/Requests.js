// src/pages/Requests.js
// ─────────────────────────────────────────────────────────
// The main dashboard showing all help requests.
// Has search/filter functionality and real-time updates.
// ─────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import RequestCard from "../components/RequestCard";
import "./Requests.css";

const CATEGORIES = ["All", "Food", "Medical", "Emergency", "Education", "Other"];
const STATUS_FILTERS = ["All", "Open", "Accepted", "Completed"];

export default function Requests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [urgentOnly, setUrgentOnly] = useState(false);

  // ── Real-time listener for ALL requests ──────────────────
  useEffect(() => {
    // Order: urgent first, then newest first
    const q = query(
      collection(db, "requests"),
      orderBy("isUrgent", "desc"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
      setLoading(false);
    });

    return unsubscribe; // Stop listening when component unmounts
  }, []);

  // ── Apply filters locally (no extra DB reads) ────────────
  const filtered = requests.filter((req) => {
    const matchSearch =
      search === "" ||
      req.name?.toLowerCase().includes(search.toLowerCase()) ||
      req.description?.toLowerCase().includes(search.toLowerCase()) ||
      req.location?.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      categoryFilter === "All" || req.category === categoryFilter;

    const matchStatus =
      statusFilter === "All" ||
      req.status === statusFilter.toLowerCase();

    const matchUrgent = !urgentOnly || req.isUrgent === true;

    return matchSearch && matchCategory && matchStatus && matchUrgent;
  });

  return (
    <div className="requests-page">
      <div className="container">

        {/* ── Page Header ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Help Requests</h1>
            <p className="page-subtitle">
              {requests.filter(r => r.status === "open").length} people waiting for help
            </p>
          </div>
          {user && (
            <Link to="/post" className="btn btn-primary">
              + Post a Request
            </Link>
          )}
        </div>

        {/* ── Search + Filters ── */}
        <div className="filters-bar">
          {/* Search */}
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, description, location..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          {/* Filter Row */}
          <div className="filter-row">
            {/* Category pills */}
            <div className="filter-pills">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`pill ${categoryFilter === cat ? "pill-active" : ""}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Status select */}
            <select
              className="form-select status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            {/* Urgent toggle */}
            <label className="toggle-wrapper urgent-toggle">
              <div className="toggle">
                <input
                  type="checkbox"
                  checked={urgentOnly}
                  onChange={(e) => setUrgentOnly(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </div>
              <span className="toggle-label">Urgent only</span>
            </label>
          </div>
        </div>

        {/* ── Results ── */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="icon">🔍</span>
            <h3>No requests found</h3>
            <p>Try adjusting your filters, or be the first to post a request.</p>
          </div>
        ) : (
          <>
            <p className="results-count">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
            <div className="requests-grid">
              {filtered.map((req, i) => (
                <div
                  key={req.id}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <RequestCard request={req} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
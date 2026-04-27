import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import RequestCard from "../components/RequestCard";
import "./Home.css";

export default function Home() {
  const { user } = useAuth();
  const [recentRequests, setRecentRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, active: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch recent open requests for the homepage preview
  useEffect(() => {
    const q = query(
      collection(db, "requests"),
      where("status", "==", "open"),
      orderBy("isUrgent", "desc"), // Urgent first
      orderBy("createdAt", "desc"),
      limit(3)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRecentRequests(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Fetch stats (total requests, completed, active)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "requests"), (snapshot) => {
      const all = snapshot.docs.map((d) => d.data());
      setStats({
        total: all.length,
        completed: all.filter((r) => r.status === "completed").length,
        active: all.filter((r) => r.status === "open").length,
      });
    });
    return unsubscribe;
  }, []);

  return (
    <div className="home-page">

      {/* ── Hero Section ── */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <div className="hero-eyebrow">Built for India. Built for humanity.</div>
            <h1 className="hero-title">
              A bridge between <em>need</em> and <em>help</em>
            </h1>
            <p className="hero-subtitle">
              SevaSetu connects people who need help — food, medical aid, education —
              with volunteers ready to act. Fast, simple, human.
            </p>
            <div className="hero-actions">
              {user ? (
                <>
                  <Link to="/post" className="btn btn-primary btn-lg">
                    🤲 Ask for Help
                  </Link>
                  <Link to="/requests" className="btn btn-outline btn-lg">
                    Browse Requests
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-primary btn-lg">
                    Get Started →
                  </Link>
                  <Link to="/requests" className="btn btn-outline btn-lg">
                    See Open Requests
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card vc1">
              <span>🍛</span> <span>Food needed in Dharavi</span>
              <span className="vc-badge urgent">Urgent</span>
            </div>
            <div className="visual-card vc2">
              <span>🏥</span> <span>Medical help in Andheri</span>
              <span className="vc-badge open">Open</span>
            </div>
            <div className="visual-card vc3">
              <span>📚</span> <span>Tutoring in Pune</span>
              <span className="vc-badge done">Done ✓</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="stats-bar">
        <div className="container stats-inner">
          <StatItem value={stats.total} label="Requests posted" icon="📋" />
          <StatItem value={stats.active} label="Waiting for help" icon="🙏" />
          <StatItem value={stats.completed} label="Helps completed" icon="✅" />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How SevaSetu works</h2>
          <div className="steps-grid">
            <Step num="01" icon="✍️" title="Post a request" desc="Tell us what you need — food, medical, emergency, or education. Mark it urgent if needed." />
            <Step num="02" icon="👀" title="Volunteers see it" desc="Nearby volunteers and NGOs instantly see your request on the dashboard." />
            <Step num="03" icon="🤝" title="Get connected" desc="A volunteer accepts your request and help is on the way. Status updates in real-time." />
          </div>
        </div>
      </section>

      {/* ── Recent Open Requests ── */}
      <section className="recent-requests">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Requests needing help now</h2>
            <Link to="/requests" className="see-all-link">See all →</Link>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : recentRequests.length === 0 ? (
            <div className="empty-state">
              <span className="icon">🌟</span>
              <h3>All caught up!</h3>
              <p>No open requests right now. Be the first to post one.</p>
            </div>
          ) : (
            <div className="requests-preview-grid">
              {recentRequests.map((req) => (
                <RequestCard key={req.id} request={req} />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

// ── Helper sub-components ─────────────────────────────────

function StatItem({ value, label, icon }) {
  return (
    <div className="stat-item">
      <span className="stat-icon">{icon}</span>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function Step({ num, icon, title, desc }) {
  return (
    <div className="step-card card">
      <div className="step-num">{num}</div>
      <div className="step-icon">{icon}</div>
      <h3 className="step-title">{title}</h3>
      <p className="step-desc">{desc}</p>
    </div>
  );
}
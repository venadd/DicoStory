import React from "react";
import {
  BookOpen,
  Plus,
  Compass,
  MapPin,
  LogOut,
  LogIn,
  UserPlus,
  Layers,
  Sparkles,
  Bookmark,
} from "lucide-react";

export default function Sidebar({
  currentView,
  setView,
  user,
  savedCount = 0,
  onLogout,
}) {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="brand-section">
        <div className="brand-logo-icon">
          <BookOpen size={20} strokeWidth={2.4} />
        </div>
        <div className="brand-title">DicoStory</div>
      </div>

      {/* Add New Button with 3 colored dots (exact Mino style) */}
      <button
        className="sidebar-add-btn"
        onClick={() => setView(user ? "add" : "login")}
        title="Create a new story"
      >
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Plus size={16} strokeWidth={2.5} />
          Add new
        </span>
        <div className="dot-indicators">
          <span className="dot-indicator dot-yellow" />
          <span className="dot-indicator dot-blue" />
          <span className="dot-indicator dot-red" />
        </div>
      </button>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        <button
          className={`nav-item ${currentView === "feed" ? "active" : ""}`}
          onClick={() => setView("feed")}
        >
          <Layers size={18} />
          <span>All Stories</span>
        </button>

        <button
          className={`nav-item ${currentView === "saved" ? "active" : ""}`}
          onClick={() => setView("saved")}
        >
          <Bookmark size={18} />
          <span style={{ flex: 1 }}>Saved Stories</span>
          {savedCount > 0 && (
            <span
              style={{
                fontSize: "0.72rem",
                padding: "2px 7px",
                borderRadius: "9999px",
                backgroundColor: currentView === "saved" ? "#FFFFFF" : "#18181B",
                color: currentView === "saved" ? "#18181B" : "#FFFFFF",
                fontWeight: 700,
              }}
            >
              {savedCount}
            </span>
          )}
        </button>

        <button
          className={`nav-item ${currentView === "map" ? "active" : ""}`}
          onClick={() => setView("map")}
        >
          <MapPin size={18} />
          <span>Explore Map</span>
        </button>

        {user ? (
          <>
            <button
              className={`nav-item ${currentView === "my-stories" ? "active" : ""}`}
              onClick={() => setView("my-stories")}
            >
              <Compass size={18} />
              <span>My Stories</span>
            </button>

            <button
              className={`nav-item ${currentView === "add" ? "active" : ""}`}
              onClick={() => setView("add")}
            >
              <Plus size={18} />
              <span>Create Story</span>
            </button>
          </>
        ) : (
          <>
            <button
              className={`nav-item ${currentView === "login" ? "active" : ""}`}
              onClick={() => setView("login")}
            >
              <LogIn size={18} />
              <span>Sign In</span>
            </button>

            <button
              className={`nav-item ${currentView === "register" ? "active" : ""}`}
              onClick={() => setView("register")}
            >
              <UserPlus size={18} />
              <span>Create Account</span>
            </button>
          </>
        )}
      </nav>

      {/* Upgrade / Account Box (Mino Style) */}
      <div className="sidebar-footer-card">
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "#FEF7D5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#854D0E",
          }}
        >
          <Sparkles size={18} />
        </div>
        <div>
          <strong style={{ fontSize: "0.85rem", color: "#18181B" }}>
            {user ? `Halo, ${user.name}` : "Dicoding Community"}
          </strong>
          <p style={{ marginTop: "4px" }}>
            {user
              ? "Bagikan momen berharga Anda ke seluruh dunia"
              : "Masuk untuk membuat cerita & simpan favorit"}
          </p>
        </div>
        {user ? (
          <button className="btn-sidebar-upgrade" onClick={onLogout}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <LogOut size={14} /> Keluar
            </span>
          </button>
        ) : (
          <button
            className="btn-sidebar-upgrade"
            onClick={() => setView("login")}
          >
            Masuk Sekarang
          </button>
        )}
      </div>
    </aside>
  );
}

import React, { useEffect } from "react";
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
  X,
  Download,
} from "lucide-react";

export default function Sidebar({
  currentView,
  setView,
  user,
  savedCount = 0,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
  canInstallPWA = false,
  onInstallPWA,
}) {
  // Body scroll-lock when mobile drawer is open
  useEffect(() => {
    if (isOpenMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpenMobile]);

  const handleNavClick = (view) => {
    setView(view);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`sidebar-backdrop ${isOpenMobile ? "open" : ""}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* Main Sidebar Container (Acts as Drawer on Mobile) */}
      <aside className={`sidebar ${isOpenMobile ? "mobile-open" : ""}`}>
        {/* Brand Header */}
        <div className="brand-section">
          <div className="brand-logo-icon">
            <BookOpen size={20} strokeWidth={2.4} />
          </div>
          <div className="brand-title">DicoStory</div>

          {/* Close button inside Mobile Drawer */}
          {onCloseMobile && (
            <button
              className="drawer-close-btn"
              onClick={onCloseMobile}
              aria-label="Tutup Menu Navigasi"
              title="Tutup Menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Add New Button */}
        <button
          className="sidebar-add-btn"
          onClick={() => handleNavClick(user ? "add" : "login")}
          title="Buat cerita baru"
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
            onClick={() => handleNavClick("feed")}
          >
            <Layers size={18} />
            <span>All Stories</span>
          </button>

          <button
            className={`nav-item ${currentView === "saved" ? "active" : ""}`}
            onClick={() => handleNavClick("saved")}
          >
            <Bookmark size={18} />
            <span style={{ flex: 1, textAlign: "left" }}>Saved Stories</span>
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
            onClick={() => handleNavClick("map")}
          >
            <MapPin size={18} />
            <span>Explore Map</span>
          </button>

          {canInstallPWA && (
            <button
              className="nav-item"
              onClick={() => {
                if (onInstallPWA) onInstallPWA();
                if (onCloseMobile) onCloseMobile();
              }}
              style={{
                backgroundColor: "#FEF3C7",
                color: "#92400E",
                fontWeight: 700,
              }}
            >
              <Download size={18} />
              <span>Instal Aplikasi</span>
            </button>
          )}

          {user ? (
            <>
              <button
                className={`nav-item ${currentView === "my-stories" ? "active" : ""}`}
                onClick={() => handleNavClick("my-stories")}
              >
                <Compass size={18} />
                <span>My Stories</span>
              </button>

              <button
                className={`nav-item ${currentView === "add" ? "active" : ""}`}
                onClick={() => handleNavClick("add")}
              >
                <Plus size={18} />
                <span>Create Story</span>
              </button>
            </>
          ) : (
            <>
              <button
                className={`nav-item ${currentView === "login" ? "active" : ""}`}
                onClick={() => handleNavClick("login")}
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </button>

              <button
                className={`nav-item ${currentView === "register" ? "active" : ""}`}
                onClick={() => handleNavClick("register")}
              >
                <UserPlus size={18} />
                <span>Create Account</span>
              </button>
            </>
          )}
        </nav>


        {/* Upgrade / Account Box */}
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
              flexShrink: 0,
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
            <button
              className="btn-sidebar-upgrade"
              onClick={() => {
                onLogout();
                if (onCloseMobile) onCloseMobile();
              }}
            >
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <LogOut size={14} /> Keluar
              </span>
            </button>
          ) : (
            <button
              className="btn-sidebar-upgrade"
              onClick={() => handleNavClick("login")}
            >
              Masuk Sekarang
            </button>
          )}
        </div>
      </aside>
    </>
  );
}


import React from "react";
import { Search, User, LogIn, Bell } from "lucide-react";

export default function Header({
  title = "MY STORIES",
  searchQuery,
  setSearchQuery,
  user,
  setView,
}) {
  return (
    <header className="top-header">
      <h1 className="page-main-title">{title}</h1>

      <div className="header-search-bar">
        <Search size={17} color="#94A3B8" />
        <input
          type="text"
          placeholder="Cari cerita atau penulis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="header-right">
        {user ? (
          <div
            className="user-profile-badge"
            onClick={() => setView("my-stories")}
            title="Lihat Cerita Saya"
          >
            <div className="user-avatar-circle">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="user-name-text">{user.name}</span>
          </div>
        ) : (
          <button
            className="user-profile-badge"
            style={{ cursor: "pointer", border: "1px solid #18181B" }}
            onClick={() => setView("login")}
          >
            <div className="user-avatar-circle">
              <LogIn size={14} />
            </div>
            <span className="user-name-text">Masuk</span>
          </button>
        )}
      </div>
    </header>
  );
}

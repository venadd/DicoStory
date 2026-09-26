import React, { useState, useMemo, useEffect } from "react";
import StoryCard from "../components/StoryCard.jsx";
import AddStoryCard from "../components/AddStoryCard.jsx";
import {
  Folder,
  MapPin,
  Search,
  Filter,
  RefreshCw,
  Compass,
  Bookmark,
} from "lucide-react";

export default function FeedPage({
  stories = [],
  isLoading,
  error,
  savedIds = [],
  onToggleSave,
  initialTab = "all",
  onRefresh,
  onViewDetails,
  onOpenLocation,
  onNavigateAdd,
  onNavigateMap,
  user,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchFilter, setSearchFilter] = useState("");
  const [locationOnly, setLocationOnly] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Filtered stories logic
  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      // Tab filter
      if (activeTab === "my" && user) {
        if (story.name !== user.name) return false;
      }
      if (activeTab === "saved") {
        if (!savedIds.includes(story.id)) return false;
      }
      if (activeTab === "location" && (!story.lat || !story.lon)) {
        return false;
      }
      if (locationOnly && (!story.lat || !story.lon)) {
        return false;
      }

      // Search keyword filter
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const authorMatch = story.name?.toLowerCase().includes(query);
        const descMatch = story.description?.toLowerCase().includes(query);
        return authorMatch || descMatch;
      }

      return true;
    });
  }, [stories, activeTab, searchFilter, locationOnly, user, savedIds]);

  const storiesWithLocationCount = useMemo(() => {
    return stories.filter((s) => s.lat && s.lon).length;
  }, [stories]);

  return (
    <div className="content-body">
      {/* 1. TOP SECTION: RECENT COLLECTIONS / TOPICS (Mino Style) */}
      <section>
        <div className="section-header-row">
          <h2 className="section-title">Kategori Cerita</h2>
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              Semua Cerita
            </button>
            <button
              className={`tab-btn ${activeTab === "saved" ? "active" : ""}`}
              onClick={() => setActiveTab("saved")}
            >
              Tersimpan ({savedIds.length})
            </button>
            <button
              className={`tab-btn ${activeTab === "location" ? "active" : ""}`}
              onClick={() => setActiveTab("location")}
            >
              Ada Lokasi ({storiesWithLocationCount})
            </button>
            {user && (
              <button
                className={`tab-btn ${activeTab === "my" ? "active" : ""}`}
                onClick={() => setActiveTab("my")}
              >
                Cerita Saya
              </button>
            )}
          </div>
        </div>

        <div className="folders-row">
          {/* Folder 1: Soft Blue - All Stories */}
          <div
            className="folder-card card-pastel-blue"
            onClick={() => setActiveTab("all")}
            title="Tampilkan semua cerita"
          >
            <div className="folder-top">
              <div
                className="folder-icon"
                style={{ backgroundColor: "#D1E3FB", color: "#1E40AF" }}
              >
                <Folder size={18} />
              </div>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1E3A8A" }}>
                •••
              </span>
            </div>
            <div>
              <div className="folder-title">Eksplorasi Umum</div>
              <div className="folder-date">{stories.length} cerita tersimpan</div>
            </div>
          </div>

          {/* Folder 2: Soft Peach - Jelajah Peta */}
          <div
            className="folder-card card-pastel-peach"
            onClick={() => {
              if (onNavigateMap) {
                onNavigateMap();
              }
            }}
            title="Buka Peta Interaktif Seluruh Indonesia"
            style={{ cursor: "pointer" }}
          >
            <div className="folder-top">
              <div
                className="folder-icon"
                style={{ backgroundColor: "#F9D4CD", color: "#9A3412" }}
              >
                <Compass size={18} />
              </div>
              <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#9A3412", backgroundColor: "#F9D4CD", padding: "3px 8px", borderRadius: "9999px" }}>
                Buka Peta
              </span>
            </div>
            <div>
              <div className="folder-title">Jelajah Peta</div>
              <div className="folder-date">{storiesWithLocationCount} cerita berkoordinat GPS</div>
            </div>
          </div>

          {/* Folder 3: Soft Lavender - Tersimpan / Bookmark */}
          <div
            className="folder-card card-pastel-lavender"
            onClick={() => setActiveTab("saved")}
            title="Lihat cerita yang Anda bookmark"
          >
            <div className="folder-top">
              <div
                className="folder-icon"
                style={{ backgroundColor: "#DFD3F7", color: "#5B21B6" }}
              >
                <Bookmark size={18} fill={savedIds.length > 0 ? "#5B21B6" : "none"} />
              </div>
              <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#5B21B6", backgroundColor: "#DFD3F7", padding: "3px 8px", borderRadius: "9999px" }}>
                {savedIds.length} Tersimpan
              </span>
            </div>
            <div>
              <div className="folder-title">Koleksi Favorit</div>
              <div className="folder-date">Cerita yang Anda simpan</div>
            </div>
          </div>

          {/* Dashed New Card in Folder Row */}
          <div
            className="dashed-add-card"
            style={{ minHeight: "120px", padding: "16px" }}
            onClick={onNavigateAdd}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#18181B",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              +
            </div>
            <span style={{ fontSize: "0.86rem", fontWeight: 700 }}>
              + Cerita Baru
            </span>
          </div>
        </div>
      </section>

      {/* 2. FILTER & SEARCH BAR (Jobseeker Style) */}
      <section className="filter-search-box">
        <div className="filter-input-group">
          <Search size={18} color="#64748B" />
          <input
            type="text"
            placeholder="Cari berdasarkan kata kunci atau penulis..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>

        <div className="filter-input-group">
          <MapPin size={18} color="#64748B" />
          <select
            value={locationOnly ? "with-location" : "all"}
            onChange={(e) => setLocationOnly(e.target.value === "with-location")}
          >
            <option value="all">Semua Tipe Cerita</option>
            <option value="with-location">Hanya Cerita dengan Lokasi GPS</option>
          </select>
        </div>

        <button
          className="btn-black-search"
          onClick={() => {}}
        >
          <Filter size={16} /> Filter
        </button>
      </section>

      {/* 3. STORIES GRID */}
      <section>
        <div className="section-header-row">
          <h2 className="section-title">
            {activeTab === "saved"
              ? "Cerita Tersimpan (Bookmark)"
              : activeTab === "my"
              ? "Cerita Saya"
              : activeTab === "location"
              ? "Cerita dengan Lokasi GPS"
              : "Daftar Cerita"}{" "}
            <span style={{ fontSize: "0.9rem", color: "#64748B", fontWeight: 500 }}>
              ({filteredStories.length} cerita)
            </span>
          </h2>

          <button
            className="tab-btn"
            onClick={onRefresh}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={14} /> Muat Ulang
          </button>
        </div>

        {isLoading ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "#64748B",
              fontSize: "0.95rem",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid #E2E8F0",
                borderTopColor: "#18181B",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px auto",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Memuat cerita dari Dicoding Story API...
          </div>
        ) : error ? (
          <div
            style={{
              padding: "40px",
              backgroundColor: "#FCE8E2",
              borderRadius: "18px",
              border: "1px solid #F8D3CA",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#882E1E", fontWeight: 700, marginBottom: "12px" }}>
              Gagal memuat cerita: {error}
            </p>
            <button className="btn-black-search" style={{ margin: "0 auto" }} onClick={onRefresh}>
              Coba Lagi
            </button>
          </div>
        ) : filteredStories.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              border: "1px solid #E5E7EB",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#F4F5F7",
                color: "#64748B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px auto",
              }}
            >
              {activeTab === "saved" ? <Bookmark size={22} /> : <Search size={22} />}
            </div>
            <p style={{ color: "#18181B", fontSize: "1.05rem", fontWeight: 700, marginBottom: "6px" }}>
              {activeTab === "saved"
                ? "Belum ada cerita yang disimpan"
                : "Tidak ada cerita yang cocok"}
            </p>
            <p style={{ color: "#64748B", fontSize: "0.88rem", marginBottom: "20px", maxWidth: "380px", margin: "0 auto 20px auto" }}>
              {activeTab === "saved"
                ? "Klik ikon bookmark pada kartu cerita mana pun untuk menyimpannya ke koleksi ini."
                : "Coba ubah kata kunci pencarian atau sesuaikan opsi filter Anda."}
            </p>
            {activeTab === "saved" ? (
              <button
                className="btn-black-search"
                style={{ margin: "0 auto" }}
                onClick={() => setActiveTab("all")}
              >
                Jelajahi Semua Cerita
              </button>
            ) : (
              <button
                className="btn-black-search"
                style={{ margin: "0 auto" }}
                onClick={onNavigateAdd}
              >
                Buat Cerita Sekarang
              </button>
            )}
          </div>
        ) : (
          <div className="cards-grid">
            {/* Dashed Create Card as the first item */}
            <AddStoryCard onClick={onNavigateAdd} />

            {/* List of Pastel Cards with interactive bookmark */}
            {filteredStories.map((story, index) => (
              <StoryCard
                key={story.id || index}
                story={story}
                index={index}
                isSaved={savedIds.includes(story.id)}
                onToggleSave={onToggleSave}
                onViewDetails={onViewDetails}
                onOpenLocation={onOpenLocation}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

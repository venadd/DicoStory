import React, { useEffect, useRef } from "react";
import { X, MapPin, Calendar, Bookmark } from "lucide-react";
import L from "leaflet";
import { createCustomMarker } from "../utils/map-icons.js";

export default function StoryDetailModal({
  story,
  isSaved = false,
  onToggleSave,
  onClose,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!story) return;

    const hasValidCoords =
      story.lat !== undefined &&
      story.lat !== null &&
      !isNaN(story.lat) &&
      story.lon !== undefined &&
      story.lon !== null &&
      !isNaN(story.lon);

    if (hasValidCoords && mapContainerRef.current) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([story.lat, story.lon], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const marker = L.marker([story.lat, story.lon], {
        icon: createCustomMarker("#18181B"),
      }).addTo(map);

      marker
        .bindPopup(
          `<strong>${story.name || "Cerita"}</strong><br/><span style="font-size: 0.8rem; color: #4B5563;">${(story.description || "").slice(0, 50)}...</span>`
        )
        .openPopup();

      mapInstanceRef.current = map;

      const timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);

      return () => {
        clearTimeout(timer);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, [story]);

  if (!story) return null;

  const formattedDate = story.createdAt
    ? new Date(story.createdAt).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const hasLocation =
    story.lat !== undefined &&
    story.lat !== null &&
    !isNaN(story.lat) &&
    story.lon !== undefined &&
    story.lon !== null &&
    !isNaN(story.lon);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="modal-close-btn" onClick={onClose} title="Tutup">
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: "44px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "50%",
                backgroundColor: "#18181B",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "1.15rem",
                flexShrink: 0,
              }}
            >
              {story.name ? story.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0F172A", lineHeight: 1.2 }}>
                {story.name || "Anonim"}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748B", fontSize: "0.82rem", marginTop: "4px" }}>
                <Calendar size={13} />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          {onToggleSave && (
            <button
              onClick={() => onToggleSave(story)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "9999px",
                border: "1px solid #E2E8F0",
                backgroundColor: isSaved ? "#18181B" : "#FFFFFF",
                color: isSaved ? "#FFFFFF" : "#18181B",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              title={isSaved ? "Hapus dari Simpanan" : "Simpan Cerita"}
            >
              <Bookmark size={15} fill={isSaved ? "#FFFFFF" : "none"} />
              <span>{isSaved ? "Tersimpan" : "Simpan"}</span>
            </button>
          )}
        </div>

        {/* Photo */}
        {story.photoUrl && (
          <div
            style={{
              borderRadius: "18px",
              overflow: "hidden",
              marginBottom: "20px",
              maxHeight: "360px",
              backgroundColor: "#F8F9FA",
              border: "1px solid #ECEFF2",
            }}
          >
            <img
              src={story.photoUrl}
              alt={story.name}
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
          </div>
        )}

        {/* Description */}
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#18181B", marginBottom: "8px" }}>
            Cerita
          </h3>
          <p
            style={{
              fontSize: "0.95rem",
              lineHeight: 1.6,
              color: "#334155",
              whiteSpace: "pre-line",
            }}
          >
            {story.description}
          </p>
        </div>

        {/* Location Map (Contained inside its card) */}
        {hasLocation && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
              <MapPin size={16} color="#18181B" />
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#18181B" }}>
                Lokasi Cerita ({story.lat.toFixed(4)}, {story.lon.toFixed(4)})
              </h3>
            </div>
            <div
              style={{
                width: "100%",
                height: "230px",
                borderRadius: "16px",
                border: "1px solid #E2E8F0",
                overflow: "hidden",
                position: "relative",
                isolation: "isolate",
              }}
            >
              <div
                ref={mapContainerRef}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
        )}

        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
          <button
            className="btn-black-search"
            onClick={onClose}
            style={{ padding: "10px 24px" }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

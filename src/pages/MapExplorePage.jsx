import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { ArrowLeft, MapPin, Eye, Compass, Layers } from "lucide-react";
import { createCustomMarker } from "../utils/map-icons.js";

export default function MapExplorePage({
  stories = [],
  focusedStory = null,
  onViewDetails,
  onBack,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const [selectedStoryId, setSelectedStoryId] = useState(
    focusedStory?.id || null
  );

  const storiesWithLocation = stories.filter(
    (s) =>
      s.lat !== undefined &&
      s.lat !== null &&
      !isNaN(s.lat) &&
      s.lon !== undefined &&
      s.lon !== null &&
      !isNaN(s.lon)
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center Indonesia or focused story
    const initialCenter = focusedStory
      ? [focusedStory.lat, focusedStory.lon]
      : storiesWithLocation.length > 0
      ? [storiesWithLocation[0].lat, storiesWithLocation[0].lon]
      : [-2.5489, 118.0149]; // Center of Indonesia

    const initialZoom = focusedStory ? 14 : 5;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(initialCenter, initialZoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const markersGroup = L.featureGroup().addTo(map);
    markersRef.current = {};

    storiesWithLocation.forEach((story) => {
      const isFocused = focusedStory && focusedStory.id === story.id;
      const markerColor = isFocused ? "#2563EB" : "#18181B";

      const marker = L.marker([story.lat, story.lon], {
        icon: createCustomMarker(markerColor),
      }).addTo(markersGroup);

      markersRef.current[story.id] = marker;

      // Popup Content
      const popupDiv = document.createElement("div");
      popupDiv.style.minWidth = "200px";
      popupDiv.style.maxWidth = "240px";
      popupDiv.style.fontFamily = "Plus Jakarta Sans, sans-serif";

      popupDiv.innerHTML = `
        <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; color: #18181B;">
          ${story.name || "Anonim"}
        </div>
        ${
          story.photoUrl
            ? `<div style="width: 100%; height: 110px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; background: #f3f4f6;">
                <img src="${story.photoUrl}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
               </div>`
            : ""
        }
        <p style="font-size: 0.8rem; color: #4B5563; line-height: 1.4; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${story.description}
        </p>
        <button id="map-popup-detail-${story.id}" style="
          width: 100%;
          background-color: #18181B;
          color: #FFFFFF;
          border: none;
          padding: 8px 12px;
          border-radius: 9999px;
          font-family: inherit;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.15s;
        ">
          Buka Cerita Lengkap
        </button>
      `;

      marker.bindPopup(popupDiv);

      marker.on("popupopen", () => {
        setSelectedStoryId(story.id);
        const btn = document.getElementById(`map-popup-detail-${story.id}`);
        if (btn) {
          btn.onclick = () => onViewDetails(story);
        }
      });
    });

    // If focused on specific story, open popup
    if (focusedStory && markersRef.current[focusedStory.id]) {
      setTimeout(() => {
        markersRef.current[focusedStory.id].openPopup();
      }, 300);
    } else if (storiesWithLocation.length > 1) {
      map.fitBounds(markersGroup.getBounds().pad(0.1));
    }

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
  }, [storiesWithLocation.length, focusedStory]);

  // Handle clicking a story from side list to fly to it
  const handleSelectStory = (story) => {
    setSelectedStoryId(story.id);
    if (mapInstanceRef.current && markersRef.current[story.id]) {
      mapInstanceRef.current.flyTo([story.lat, story.lon], 14, {
        duration: 1.2,
      });
      setTimeout(() => {
        markersRef.current[story.id].openPopup();
      }, 1200);
    }
  };

  return (
    <div
      className="content-body"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        height: "calc(100vh - 90px)",
        paddingBottom: "24px",
      }}
    >
      {/* Top Bar Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <button
          className="tab-btn"
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.95rem",
          }}
        >
          <ArrowLeft size={18} /> Kembali ke Beranda
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            className="card-tag-pill"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              padding: "6px 14px",
              fontSize: "0.84rem",
            }}
          >
            <MapPin size={14} color="#18181B" />
            <span>{storiesWithLocation.length} Cerita di Peta</span>
          </span>
        </div>
      </div>

      {/* Main Map View + Sidebar Container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: "18px",
          minHeight: 0,
          position: "relative",
        }}
      >
        {/* Left Mini Story Drawer */}
        <div
          style={{
            width: "320px",
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            border: "1px solid #ECEFF2",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflowY: "auto",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 8px" }}>
            <Compass size={18} color="#18181B" />
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#18181B" }}>
              Daftar Lokasi Cerita
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {storiesWithLocation.map((story) => {
              const isSelected = selectedStoryId === story.id;
              return (
                <div
                  key={story.id}
                  onClick={() => handleSelectStory(story)}
                  style={{
                    padding: "12px",
                    borderRadius: "14px",
                    backgroundColor: isSelected ? "#F4F5F7" : "#FAFAFA",
                    border: isSelected ? "1.5px solid #18181B" : "1px solid #E5E7EB",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <strong style={{ fontSize: "0.88rem", color: "#18181B" }}>
                      {story.name || "Anonim"}
                    </strong>
                    <span style={{ fontSize: "0.72rem", color: "#64748B" }}>
                      {story.lat.toFixed(2)}, {story.lon.toFixed(2)}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#4B5563",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.4,
                      marginBottom: "8px",
                    }}
                  >
                    {story.description}
                  </p>
                  <button
                    className="btn-card-secondary"
                    style={{
                      padding: "4px 10px",
                      fontSize: "0.74rem",
                      borderRadius: "9999px",
                      width: "100%",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(story);
                    }}
                  >
                    Buka Detail Cerita
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map Container */}
        <div
          style={{
            flex: 1,
            borderRadius: "22px",
            border: "1px solid #ECEFF2",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
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
    </div>
  );
}

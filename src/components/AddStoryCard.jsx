import React from "react";
import { Plus } from "lucide-react";

export default function AddStoryCard({ onClick }) {
  return (
    <div
      className="dashed-add-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      title="Tambah Cerita Baru"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="dashed-icon-circle">
        <Plus size={24} strokeWidth={2.5} />
      </div>
      <span className="dashed-card-label">Tambah Cerita</span>
      <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
        Unggah foto & bagikan kisah
      </span>
    </div>
  );
}

import React from "react";
import { MapPin, Calendar, Bookmark } from "lucide-react";

const PASTEL_CLASSES = [
  "card-pastel-blue",
  "card-pastel-peach",
  "card-pastel-yellow",
  "card-pastel-mint",
  "card-pastel-lavender",
  "card-pastel-almond",
];

export default function StoryCard({
  story,
  index = 0,
  isSaved = false,
  onToggleSave,
  onViewDetails,
  onOpenLocation,
}) {
  const pastelClass = PASTEL_CLASSES[index % PASTEL_CLASSES.length];

  const formattedDate = story.createdAt
    ? new Date(story.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Baru saja";

  const hasLocation =
    story.lat !== undefined &&
    story.lat !== null &&
    !isNaN(story.lat) &&
    story.lon !== undefined &&
    story.lon !== null &&
    !isNaN(story.lon);

  return (
    <article className={`story-card ${pastelClass}`}>
      {/* Top Author Row */}
      <div className="card-top">
        <div className="card-avatar-row">
          <div className="card-avatar-circle">
            {story.name ? story.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="card-author-info">
            <span className="card-author-name">{story.name || "Anonim"}</span>
            <span className="card-date">{formattedDate}</span>
          </div>
        </div>

        <button
          className="card-bookmark-btn"
          title={isSaved ? "Hapus dari Simpanan" : "Simpan Cerita"}
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleSave) {
              onToggleSave(story);
            }
          }}
          style={{
            backgroundColor: isSaved ? "rgba(24, 24, 27, 0.1)" : "transparent",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
          }}
        >
          <Bookmark
            size={18}
            fill={isSaved ? "#18181B" : "none"}
            color={isSaved ? "#18181B" : "#64748B"}
          />
        </button>
      </div>

      {/* Story Image */}
      {story.photoUrl && (
        <div
          className="card-image-wrapper"
          onClick={() => onViewDetails(story)}
          style={{ cursor: "pointer" }}
        >
          <img
            src={story.photoUrl}
            alt={`Foto cerita oleh ${story.name}`}
            loading="lazy"
          />
        </div>
      )}

      {/* Story Text */}
      <p className="card-description">{story.description}</p>

      {/* Badges / Location Pill */}
      <div className="card-tags-row">
        {hasLocation && (
          <span
            className="card-tag-pill"
            style={{ cursor: onOpenLocation ? "pointer" : "default" }}
            onClick={(e) => {
              if (onOpenLocation) {
                e.stopPropagation();
                onOpenLocation(story);
              }
            }}
          >
            <MapPin size={12} />
            <span>Lokasi Tersedia</span>
          </span>
        )}
        <span className="card-tag-pill">
          <Calendar size={12} />
          <span>Dicoding Story</span>
        </span>
      </div>

      {/* Action Row matching Jobseeker layout */}
      <div className="card-action-row">
        <button
          className="btn-card-secondary"
          onClick={() => onViewDetails(story)}
        >
          Details
        </button>
        <button
          className="btn-card-primary"
          onClick={() =>
            hasLocation && onOpenLocation
              ? onOpenLocation(story)
              : onViewDetails(story)
          }
        >
          {hasLocation ? "Lihat Peta" : "Buka Cerita"}
        </button>
      </div>
    </article>
  );
}

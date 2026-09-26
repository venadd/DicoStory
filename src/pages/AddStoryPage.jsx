import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  MapPin,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  X,
  Crosshair,
} from "lucide-react";
import L from "leaflet";
import Swal from "sweetalert2";
import { storyService } from "../services/api.js";
import { createCustomMarker } from "../utils/map-icons.js";

export default function AddStoryPage({ onBack, onSuccess, user }) {
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  // Map state
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize interactive Leaflet map for picking location
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const defaultLat = -6.2088;
    const defaultLng = 106.8456;

    const map = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      setLocation({ lat, lon: lng });

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], {
          icon: createCustomMarker("#18181B"),
        }).addTo(map);
      }
      markerRef.current.bindPopup("Lokasi Cerita Dipilih").openPopup();
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle live camera capture
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "warning",
        title: "Kamera Tidak Tersedia",
        text: "Tidak dapat mengakses kamera. Silakan unggah foto dari file Anda.",
        confirmButtonColor: "#18181B",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
        stopCamera();
      }
    }, "image/jpeg", 0.9);
  };

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 5) {
        Swal.fire({
          icon: "error",
          title: "Ukuran Terlalu Besar",
          text: "Maksimal ukuran foto adalah 5MB.",
          confirmButtonColor: "#18181B",
        });
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      stopCamera();
    }
  };

  // Get GPS current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire("Info", "Browser Anda tidak mendukung geolokasi", "info");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lon: longitude });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          } else {
            markerRef.current = L.marker([latitude, longitude], {
              icon: createCustomMarker("#18181B"),
            }).addTo(mapInstanceRef.current);
          }
          markerRef.current.bindPopup("Lokasi Anda Saat Ini").openPopup();
        }
      },
      (err) => {
        Swal.fire("Lokasi Gagal", err.message, "warning");
      }
    );
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!photoFile) {
      Swal.fire({
        icon: "warning",
        title: "Foto Diperlukan",
        text: "Silakan pilih foto atau ambil gambar dari kamera.",
        confirmButtonColor: "#18181B",
      });
      return;
    }

    if (!description.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Deskripsi Diperlukan",
        text: "Silakan tuliskan deskripsi cerita Anda.",
        confirmButtonColor: "#18181B",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await storyService.addStory(
        {
          description,
          photo: photoFile,
          lat: location?.lat,
          lon: location?.lon,
        },
        !!user
      );

      Swal.fire({
        icon: "success",
        title: "Cerita Berhasil Dibuat!",
        text: "Cerita Anda telah tersimpan dan siap dilihat publik.",
        confirmButtonColor: "#18181B",
      });

      onSuccess();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal Mengunggah",
        text: err.message || "Terjadi kesalahan saat mengunggah cerita.",
        confirmButtonColor: "#18181B",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="content-body" style={{ maxWidth: "860px", margin: "0 auto" }}>
      <button
        className="tab-btn"
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
          alignSelf: "flex-start",
        }}
      >
        <ArrowLeft size={16} /> Kembali ke Beranda
      </button>

      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          border: "1px solid #ECEFF2",
          padding: "32px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ marginBottom: "26px" }}>
          <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#18181B" }}>
            Buat Cerita Baru
          </h2>
          <p style={{ color: "#64748B", fontSize: "0.9rem", marginTop: "4px" }}>
            Bagikan foto dan pengalaman Anda bersama komunitas Dicoding.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Photo Section */}
          <div className="form-group">
            <label className="form-label">Foto Cerita</label>

            {photoPreview ? (
              <div
                style={{
                  position: "relative",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid #E2E8F0",
                  maxHeight: "340px",
                  backgroundColor: "#F8F9FA",
                }}
              >
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                  style={{
                    position: "absolute",
                    top: "14px",
                    right: "14px",
                    backgroundColor: "#18181B",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "50%",
                    width: "34px",
                    height: "34px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  title="Hapus foto"
                >
                  <X size={16} />
                </button>
              </div>
            ) : isCameraActive ? (
              <div
                style={{
                  position: "relative",
                  borderRadius: "16px",
                  overflow: "hidden",
                  backgroundColor: "#000000",
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: "100%", height: "300px", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "16px",
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "center",
                    gap: "12px",
                  }}
                >
                  <button
                    type="button"
                    className="btn-black-search"
                    onClick={capturePhoto}
                  >
                    <Camera size={16} /> Ambil Foto
                  </button>
                  <button
                    type="button"
                    className="btn-card-secondary"
                    style={{ padding: "8px 16px" }}
                    onClick={stopCamera}
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  border: "2px dashed #CBD5E1",
                  borderRadius: "18px",
                  padding: "36px 20px",
                  textAlign: "center",
                  backgroundColor: "#FAFAFA",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
                  <button
                    type="button"
                    className="btn-card-secondary"
                    onClick={() => document.getElementById("filePickerInput").click()}
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                  >
                    <Upload size={16} /> Pilih dari File
                  </button>

                  <button
                    type="button"
                    className="btn-black-search"
                    onClick={startCamera}
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                  >
                    <Camera size={16} /> Buka Kamera
                  </button>
                </div>
                <p style={{ color: "#94A3B8", fontSize: "0.84rem" }}>
                  Format yang didukung: JPG, PNG, WEBP (Maksimal 5MB)
                </p>
                <input
                  id="filePickerInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
            )}
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>

          {/* Description Section */}
          <div className="form-group">
            <label className="form-label">Deskripsi / Cerita Anda</label>
            <textarea
              className="form-textarea"
              placeholder="Ceritakan momen seru, pengalaman belajar, atau inspirasi Anda..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Location Picker Section */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label className="form-label" style={{ margin: 0 }}>
                Tandai Lokasi di Peta (Opsional)
              </label>
              <button
                type="button"
                className="tab-btn"
                onClick={getCurrentLocation}
                style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem" }}
              >
                <Crosshair size={14} /> Gunakan GPS Saya
              </button>
            </div>

            {location && (
              <p style={{ fontSize: "0.82rem", color: "#166534", marginBottom: "6px" }}>
                Koordinat terpilih: {location.lat.toFixed(5)}, {location.lon.toFixed(5)}
              </p>
            )}

            <div
              ref={mapContainerRef}
              style={{
                width: "100%",
                height: "240px",
                borderRadius: "16px",
                border: "1px solid #E2E8F0",
                overflow: "hidden",
              }}
            />
            <span style={{ fontSize: "0.78rem", color: "#94A3B8", marginTop: "4px" }}>
              * Klik pada peta untuk memilih titik koordinat.
            </span>
          </div>

          {/* Submit Action */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "28px" }}>
            <button
              type="button"
              className="btn-card-secondary"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-black-search"
              disabled={isSubmitting}
              style={{ minWidth: "160px", justifyContent: "center" }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Mengunggah...
                </>
              ) : (
                "Publikasikan Cerita"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { LogIn, ArrowLeft, Mail, Lock, User, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import { authService } from "../services/api.js";

export function LoginPage({ onLoginSuccess, onNavigateRegister, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsLoading(true);
      await authService.login({ email, password });
      const user = authService.getCurrentUser();

      Swal.fire({
        icon: "success",
        title: `Selamat datang, ${user?.name || "Pengguna"}!`,
        timer: 1500,
        showConfirmButton: false,
      });

      onLoginSuccess(user);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal Masuk",
        text: err.message || "Email atau kata sandi tidak valid.",
        confirmButtonColor: "#18181B",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="content-body"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          border: "1px solid #ECEFF2",
          padding: "36px 32px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
        }}
      >
        <button
          className="tab-btn"
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}
        >
          <ArrowLeft size={16} /> Ke Beranda
        </button>

        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: "#18181B",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px auto",
            }}
          >
            <LogIn size={22} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#18181B" }}>
            Selamat Datang
          </h2>
          <p style={{ color: "#64748B", fontSize: "0.88rem", marginTop: "4px" }}>
            Masuk ke akun Dicoding Story Anda
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                className="form-input"
                style={{ width: "100%", paddingLeft: "40px" }}
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail
                size={18}
                color="#94A3B8"
                style={{ position: "absolute", left: "14px", top: "14px" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Kata Sandi</label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                className="form-input"
                style={{ width: "100%", paddingLeft: "40px" }}
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <Lock
                size={18}
                color="#94A3B8"
                style={{ position: "absolute", left: "14px", top: "14px" }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-black-search"
            style={{ width: "100%", justifyContent: "center", padding: "13px", marginTop: "14px" }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> Memproses...
              </>
            ) : (
              "Masuk Sekarang"
            )}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.88rem", color: "#64748B" }}>
          Belum punya akun?{" "}
          <button
            type="button"
            onClick={onNavigateRegister}
            style={{
              background: "none",
              border: "none",
              fontWeight: 700,
              color: "#18181B",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Daftar di sini
          </button>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage({ onRegisterSuccess, onNavigateLogin, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    if (password.length < 8) {
      Swal.fire({
        icon: "warning",
        title: "Kata Sandi Kurang Panjang",
        text: "Kata sandi harus minimal 8 karakter.",
        confirmButtonColor: "#18181B",
      });
      return;
    }

    try {
      setIsLoading(true);
      await authService.register({ name, email, password });

      Swal.fire({
        icon: "success",
        title: "Pendaftaran Berhasil!",
        text: "Akun Anda telah dibuat. Silakan masuk.",
        confirmButtonColor: "#18181B",
      });

      onRegisterSuccess();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Pendaftaran Gagal",
        text: err.message || "Terjadi kesalahan saat mendaftar.",
        confirmButtonColor: "#18181B",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="content-body"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          border: "1px solid #ECEFF2",
          padding: "36px 32px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
        }}
      >
        <button
          className="tab-btn"
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}
        >
          <ArrowLeft size={16} /> Ke Beranda
        </button>

        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: "#18181B",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px auto",
            }}
          >
            <User size={22} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#18181B" }}>
            Buat Akun Baru
          </h2>
          <p style={{ color: "#64748B", fontSize: "0.88rem", marginTop: "4px" }}>
            Daftar untuk berbagi cerita Anda dengan komunitas
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="form-input"
                style={{ width: "100%", paddingLeft: "40px" }}
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <User
                size={18}
                color="#94A3B8"
                style={{ position: "absolute", left: "14px", top: "14px" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                className="form-input"
                style={{ width: "100%", paddingLeft: "40px" }}
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail
                size={18}
                color="#94A3B8"
                style={{ position: "absolute", left: "14px", top: "14px" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Kata Sandi</label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                className="form-input"
                style={{ width: "100%", paddingLeft: "40px" }}
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <Lock
                size={18}
                color="#94A3B8"
                style={{ position: "absolute", left: "14px", top: "14px" }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-black-search"
            style={{ width: "100%", justifyContent: "center", padding: "13px", marginTop: "14px" }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> Mendaftarkan...
              </>
            ) : (
              "Daftar Sekarang"
            )}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.88rem", color: "#64748B" }}>
          Sudah memiliki akun?{" "}
          <button
            type="button"
            onClick={onNavigateLogin}
            style={{
              background: "none",
              border: "none",
              fontWeight: 700,
              color: "#18181B",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Masuk di sini
          </button>
        </div>
      </div>
    </div>
  );
}

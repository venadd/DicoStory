import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import FeedPage from "./pages/FeedPage.jsx";
import AddStoryPage from "./pages/AddStoryPage.jsx";
import MapExplorePage from "./pages/MapExplorePage.jsx";
import { LoginPage, RegisterPage } from "./pages/AuthPages.jsx";
import StoryDetailModal from "./components/StoryDetailModal.jsx";
import { authService, storyService } from "./services/api.js";
import { bookmarkService } from "./services/bookmark.js";
import Swal from "sweetalert2";

export default function App() {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [currentView, setCurrentView] = useState("feed");
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStory, setSelectedStory] = useState(null);
  const [focusedStory, setFocusedStory] = useState(null);
  const [savedIds, setSavedIds] = useState(() => bookmarkService.getSavedIds());

  // Fetch stories from API
  const fetchStories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await storyService.getStories({ page: 1, size: 50, location: 1 });
      setStories(res.listStory || []);
    } catch (err) {
      console.error("Failed to fetch stories:", err);
      setError(err.message || "Gagal memuat data dari server");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Handle toggle save / bookmark
  const handleToggleSave = (story) => {
    if (!story || !story.id) return;
    const { saved, ids } = bookmarkService.toggle(story.id);
    setSavedIds(ids);

    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1800,
      timerProgressBar: false,
      backdrop: false,
    });

    const checkSvg = `
      <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #E0F4EC; border: 2px solid #16A34A; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    `;

    const infoSvg = `
      <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #F4F5F7; border: 2px solid #64748B; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
    `;

    Toast.fire({
      html: `
        <div style="display: flex; align-items: center; gap: 10px;">
          ${saved ? checkSvg : infoSvg}
          <span style="font-weight: 700; font-size: 0.88rem; color: #18181B; white-space: nowrap;">
            ${saved ? "Cerita disimpan ke Bookmark!" : "Cerita dihapus dari Bookmark"}
          </span>
        </div>
      `,
    });
  };

  // Handle logout
  const handleLogout = () => {
    Swal.fire({
      title: "Keluar Akun?",
      text: "Anda yakin ingin keluar dari sesi ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#18181B",
      cancelButtonColor: "#D4D4D8",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        authService.logout();
        setUser(null);
        setCurrentView("feed");
        Swal.fire({
          icon: "info",
          title: "Anda telah keluar",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  // Filter stories by search query from Header if present
  const displayStories = searchQuery.trim()
    ? stories.filter(
      (s) =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : stories;

  // View title helper
  const getHeaderTitle = () => {
    switch (currentView) {
      case "feed":
        return "My Stories";
      case "saved":
        return "Saved Stories";
      case "map":
        return "Explore Map";
      case "add":
        return "New Story";
      case "my-stories":
        return "My Archive";
      case "login":
        return "Sign In";
      case "register":
        return "Sign Up";
      default:
        return "My Stories";
    }
  };

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleOpenLocation = (story) => {
    setFocusedStory(story);
    setCurrentView("map");
  };

  const handleNavigateMap = (story = null) => {
    setFocusedStory(story);
    setCurrentView("map");
  };

  return (
    <div className="app-container">
      {/* 1. Left Minimalist Sidebar / Mobile Drawer Sheet */}
      <Sidebar
        currentView={currentView}
        setView={(view) => {
          if (view === "map") {
            setFocusedStory(null);
          }
          setCurrentView(view);
        }}
        user={user}
        savedCount={savedIds.length}
        onLogout={handleLogout}
        isOpenMobile={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
        canInstallPWA={!!deferredPrompt}
        onInstallPWA={handleInstallPWA}
      />


      {/* 2. Main Wrapper with Header and Content */}
      <div className="main-wrapper">
        <Header
          title={getHeaderTitle()}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          user={user}
          setView={setCurrentView}
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
        />


        {/* View Router */}
        {currentView === "feed" && (
          <FeedPage
            stories={displayStories}
            isLoading={isLoading}
            error={error}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            initialTab="all"
            onRefresh={fetchStories}
            onViewDetails={(story) => setSelectedStory(story)}
            onOpenLocation={handleOpenLocation}
            onNavigateMap={handleNavigateMap}
            onNavigateAdd={() => {
              if (!user) {
                Swal.fire({
                  icon: "info",
                  title: "Silakan Masuk",
                  text: "Anda perlu masuk untuk menambahkan cerita baru.",
                  confirmButtonColor: "#18181B",
                });
                setCurrentView("login");
              } else {
                setCurrentView("add");
              }
            }}
            user={user}
          />
        )}

        {currentView === "saved" && (
          <FeedPage
            stories={displayStories}
            isLoading={isLoading}
            error={error}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            initialTab="saved"
            onRefresh={fetchStories}
            onViewDetails={(story) => setSelectedStory(story)}
            onOpenLocation={handleOpenLocation}
            onNavigateMap={handleNavigateMap}
            onNavigateAdd={() => setCurrentView("add")}
            user={user}
          />
        )}

        {currentView === "my-stories" && (
          <FeedPage
            stories={displayStories.filter((s) => s.name === user?.name)}
            isLoading={isLoading}
            error={error}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            initialTab="my"
            onRefresh={fetchStories}
            onViewDetails={(story) => setSelectedStory(story)}
            onOpenLocation={handleOpenLocation}
            onNavigateMap={handleNavigateMap}
            onNavigateAdd={() => setCurrentView("add")}
            user={user}
          />
        )}

        {currentView === "map" && (
          <MapExplorePage
            stories={stories}
            focusedStory={focusedStory}
            onViewDetails={(story) => setSelectedStory(story)}
            onBack={() => {
              setFocusedStory(null);
              setCurrentView("feed");
            }}
          />
        )}

        {currentView === "add" && (
          <AddStoryPage
            user={user}
            onBack={() => setCurrentView("feed")}
            onSuccess={() => {
              fetchStories();
              setCurrentView("feed");
            }}
          />
        )}

        {currentView === "login" && (
          <LoginPage
            onLoginSuccess={(userData) => {
              setUser(userData);
              setCurrentView("feed");
              fetchStories();
            }}
            onNavigateRegister={() => setCurrentView("register")}
            onBack={() => setCurrentView("feed")}
          />
        )}

        {currentView === "register" && (
          <RegisterPage
            onRegisterSuccess={() => setCurrentView("login")}
            onNavigateLogin={() => setCurrentView("login")}
            onBack={() => setCurrentView("feed")}
          />
        )}
      </div>

      {/* 3. Detail Popup Modal with Leaflet Map */}
      {selectedStory && (
        <StoryDetailModal
          story={selectedStory}
          isSaved={savedIds.includes(selectedStory.id)}
          onToggleSave={handleToggleSave}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  );
}

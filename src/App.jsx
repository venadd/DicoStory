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
      timer: 1600,
      timerProgressBar: false,
    });

    Toast.fire({
      icon: saved ? "success" : "info",
      title: saved
        ? "Cerita disimpan ke Bookmark!"
        : "Cerita dihapus dari Bookmark",
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
        return "MY STORIES";
      case "saved":
        return "SAVED STORIES";
      case "map":
        return "EXPLORE MAP";
      case "add":
        return "NEW STORY";
      case "my-stories":
        return "MY ARCHIVE";
      case "login":
        return "SIGN IN";
      case "register":
        return "SIGN UP";
      default:
        return "MY STORIES";
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
      {/* 1. Left Minimalist Sidebar */}
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
      />

      {/* 2. Main Wrapper with Header and Content */}
      <div className="main-wrapper">
        <Header
          title={getHeaderTitle()}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          user={user}
          setView={setCurrentView}
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

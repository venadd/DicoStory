const BOOKMARK_STORAGE_KEY = "saved_stories";

export const bookmarkService = {
  /**
   * Get all bookmarked story IDs from localStorage
   * @returns {string[]}
   */
  getSavedIds() {
    try {
      const raw = localStorage.getItem(BOOKMARK_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Error reading saved stories:", e);
      return [];
    }
  },

  /**
   * Check if a story is bookmarked
   * @param {string} storyId
   * @returns {boolean}
   */
  isSaved(storyId) {
    if (!storyId) return false;
    const ids = this.getSavedIds();
    return ids.includes(storyId);
  },

  /**
   * Toggle bookmark status of a story
   * @param {string} storyId
   * @returns {{ saved: boolean, ids: string[] }}
   */
  toggle(storyId) {
    if (!storyId) return { saved: false, ids: [] };
    const ids = this.getSavedIds();
    let updated;
    let saved = false;

    if (ids.includes(storyId)) {
      updated = ids.filter((id) => id !== storyId);
      saved = false;
    } else {
      updated = [storyId, ...ids];
      saved = true;
    }

    try {
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving bookmarks:", e);
    }

    return { saved, ids: updated };
  },
};

export default bookmarkService;

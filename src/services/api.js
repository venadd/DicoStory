import axios from "axios";

export const BASE_URL = "https://story-api.dicoding.dev/v1";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Terjadi kesalahan pada server";
    return Promise.reject(new Error(message));
  }
);

export const authService = {
  async register({ name, email, password }) {
    return apiClient.post("/register", { name, email, password });
  },

  async login({ email, password }) {
    const res = await apiClient.post("/login", { email, password });
    if (res.loginResult) {
      localStorage.setItem("auth_token", res.loginResult.token);
      localStorage.setItem(
        "user_data",
        JSON.stringify({
          userId: res.loginResult.userId,
          name: res.loginResult.name,
        })
      );
    }
    return res;
  },

  logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  },

  getCurrentUser() {
    const raw = localStorage.getItem("user_data");
    return raw ? JSON.parse(raw) : null;
  },

  getToken() {
    return localStorage.getItem("auth_token");
  },

  isAuthenticated() {
    return !!localStorage.getItem("auth_token");
  },
};

export const storyService = {
  async getStories({ page = 1, size = 30, location = 1 } = {}) {
    return apiClient.get("/stories", {
      params: { page, size, location },
    });
  },

  async getStoryById(id) {
    return apiClient.get(`/stories/${id}`);
  },

  async addStory({ description, photo, lat, lon }, useAuth = true) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);
    if (lat !== undefined && lat !== null && lon !== undefined && lon !== null) {
      formData.append("lat", lat);
      formData.append("lon", lon);
    }

    const token = localStorage.getItem("auth_token");
    const endpoint = useAuth ? "/stories" : "/stories/guest";
    const headers = {
      "Content-Type": "multipart/form-data",
    };
    if (useAuth && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post(`${BASE_URL}${endpoint}`, formData, {
      headers,
    });
    return response.data;
  },
};

export default apiClient;

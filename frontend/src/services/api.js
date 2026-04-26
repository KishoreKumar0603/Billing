import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

const TOKEN_KEY = "billingit_access_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),

  set: (token) => localStorage.setItem(TOKEN_KEY, token),

  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = tokenStore.get();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Refresh token logic
let refreshing = null;

async function refreshToken() {
  try {
    const { data } = await api.post("/auth/refresh-token");

    if (data?.accessToken) {
      tokenStore.set(data.accessToken);
      return data.accessToken;
    }

    return null;
  } catch (err) {
    return null;
  }
}

// Auto retry on 401
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      refreshing = refreshing || refreshToken();

      const newToken = await refreshing;

      refreshing = null;

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      }

      tokenStore.clear();

      if (!location.pathname.startsWith("/login")) {
        location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
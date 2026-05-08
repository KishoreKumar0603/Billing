import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL + "/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // ✅ Enable cookies for refresh token
});

const TOKEN_KEY = "billingit_access_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// 🔐 Token refresh state management
let refreshPromise = null;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

async function refreshAccessToken() {
  try {
    // Create a new instance to avoid interceptor loops
    const refreshInstance = axios.create({
      baseURL: API_BASE,
      withCredentials: true,
    });

    const response = await refreshInstance.post("/auth/refresh-token");

    if (response?.data?.accessToken) {
      const newToken = response.data.accessToken;
      tokenStore.set(newToken);
      return newToken;
    }

    throw new Error("No access token in refresh response");
  } catch (error) {
    console.error("❌ Token refresh failed:", error.response?.status);

    // If refresh fails, clear tokens and redirect to login
    tokenStore.clear();

    // Force navigation to login
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      window.location.href = "/login?session_expired=true";
    }

    return null;
  }
}

// ✅ REQUEST INTERCEPTOR: Add access token to headers
api.interceptors.request.use(
  (config) => {
    const token = tokenStore.get();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ RESPONSE INTERCEPTOR: Handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors and skip retry attempts
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If already refreshing, queue the request
      if (refreshPromise) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Start refresh process
      refreshPromise = refreshAccessToken();

      try {
        const newToken = await refreshPromise;

        if (newToken) {
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        } else {
          // Refresh failed
          processQueue(new Error("Token refresh failed"), null);
          return Promise.reject(error);
        }
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  },
);

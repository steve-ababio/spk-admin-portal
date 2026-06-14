// "use client";

// import axios from "axios";

// const apiClient = axios.create({
//   baseURL:
//     typeof window === "undefined"
//       ? process.env.BACKEND_URL ||
//         process.env.NEXT_PUBLIC_API_URL ||
//         "http://localhost:4000"
//       : "/api-backend",
//   withCredentials: true, // automatically sends cookies (accessToken, refreshToken)
//   timeout: 15000,
// });

// // 🔹 Response interceptor – mirrors sentinel/app/lib/axios.ts
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const status = error.response?.status;

//     if (status === 401) {
//       console.warn("Unauthorized. Redirecting to login...");
//       if (typeof window !== "undefined") {
//         window.location.href = "/login";
//       }
//     }

//     if (status === 500) {
//       console.error("Server error", error);
//     }

//     return Promise.reject(error);
//   }
// );

// export default apiClient;
import axios from "axios";

const baseURL = typeof window === "undefined"
  ? (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000")
  : "/api-backend";

const apiClient = axios.create({
  baseURL,
  withCredentials: true, // Allows sending cookies if the backend relies on httpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Since tokens are stored in cookies, withCredentials: true ensures they are sent automatically.
// No manual Authorization header attachment from localStorage is needed.

let isRefreshing = false;
interface QueueItem {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor for handling common errors like 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet and it's not a refresh request itself
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/refresh-token") && !originalRequest.url?.includes("/auth/login") && !originalRequest.url?.includes("/auth/register") && !originalRequest.url?.includes("/auth/logout")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/auth/refresh-token");
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // If refresh fails, we might want to redirect to login or clear state
        if (typeof window !== "undefined") {
           // router.push('/login') logic could be triggered here via an event or callback
           // For now, just reject
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

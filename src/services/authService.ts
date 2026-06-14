import apiClient from "./apiClient";

export const authService = {
  login: async (data: any) => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get("/user/me");
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  refreshToken: async () => {
    const response = await apiClient.post("/auth/refresh-token");
    return response.data;
  },
};

export default authService;

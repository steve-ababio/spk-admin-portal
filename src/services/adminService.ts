import apiClient from "./apiClient";

export const adminService = {
  getOverview: async (params?: { preset?: string; startDate?: string; endDate?: string }) => {
    const response = await apiClient.get("/admin/overview", { params });
    return response.data;
  },

  getAnalytics: async (params?: Record<string, any>) => {
    const response = await apiClient.get("/admin/analytics", { params });
    return response.data;
  },

  getActivity: async () => {
    const response = await apiClient.get("/admin/activity");
    return response.data;
  },

  search: async (q: string) => {
    const response = await apiClient.get("/admin/search", { params: { q } });
    return response.data;
  }
};

export default adminService;

import apiClient from "./apiClient";

export const instructorService = {
  createInstructor: async (data: any) => {
    const response = await apiClient.post("/instructor", data);
    return response.data;
  },

  updateInstructor: async (id: string, data: any) => {
    const response = await apiClient.patch(`/instructor/${id}`, data);
    return response.data;
  },

  getInstructor: async (id: string) => {
    const response = await apiClient.get(`/instructor/${id}`);
    return response.data;
  },

  deleteInstructor: async (id: string) => {
    const response = await apiClient.delete(`/instructor/${id}`);
    return response.data;
  },

  listInstructors: async (params?: Record<string, any>) => {
    const response = await apiClient.get("/instructor", { params });
    return response.data;
  },
};
export default instructorService;

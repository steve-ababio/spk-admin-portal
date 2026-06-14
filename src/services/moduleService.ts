import apiClient from "./apiClient";

export const moduleService = {
  saveModule: async (data: any) => {
    const response = await apiClient.post("/module", data);
    return response.data;
  },

  findModuleById: async (id: string) => {
    const response = await apiClient.get(`/module/${id}`);
    return response.data;
  },

  deleteModule: async (id: string) => {
    const response = await apiClient.delete(`/module/${id}`);
    return response.data;
  },

  findModulesByCourse: async (courseId: string) => {
    const response = await apiClient.get(`/module/course/${courseId}`);
    return response.data;
  },
};
export default moduleService;

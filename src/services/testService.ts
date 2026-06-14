import apiClient from "./apiClient";

export const testService = {
  saveTest: async (data: any) => {
    const response = await apiClient.post("/admin/test", data);
    return response.data;
  },

  getTestByModule: async (moduleId: string) => {
    const response = await apiClient.get(`/admin/test/module/${moduleId}`);
    return response.data;
  },

  deleteTest: async (id: string) => {
    const response = await apiClient.delete(`/admin/test/${id}`);
    return response.data;
  }
};

export default testService;

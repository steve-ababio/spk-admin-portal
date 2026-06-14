import apiClient from "./apiClient";

export const courseService = {
  createCourse: async (data: any) => {
    const response = await apiClient.post("/course", data);
    return response.data;
  },

  updateCourse: async (id: string, data: any) => {
    const response = await apiClient.patch(`/course/${id}`, data);
    return response.data;
  },

  findAllCourses: async (params?: Record<string, any>) => {
    const response = await apiClient.get("/course", { params });
    return response.data;
  },

  findCourseById: async (id: string) => {
    const response = await apiClient.get(`/course/${id}`);
    return response.data;
  },

  deleteCourse: async (id: string) => {
    const response = await apiClient.delete(`/course/${id}`);
    return response.data;
  },

  getLeagueTable: async (courseId: string) => {
    const response = await apiClient.get(`/course/${courseId}/league`);
    return response.data;
  },
};
export default courseService;

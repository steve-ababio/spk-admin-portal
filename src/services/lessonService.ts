import apiClient from "./apiClient";

export const lessonService = {
  createLesson: async (data: any) => {
    const response = await apiClient.post("/lesson", data);
    return response.data;
  },

  findLessonsByModule: async (moduleId: string) => {
    const response = await apiClient.get(`/lesson/module/${moduleId}`);
    return response.data;
  },

  countLessonsByCourse: async (courseId: string) => {
    const response = await apiClient.get(`/lesson/course/${courseId}/count`);
    return response.data;
  },

  findLessonById: async (id: string) => {
    const response = await apiClient.get(`/lesson/${id}`);
    return response.data;
  },

  deleteLesson: async (id: string) => {
    const response = await apiClient.delete(`/lesson/${id}`);
    return response.data;
  },
};
export default lessonService;

import apiClient from "./apiClient";

export const reviewService = {
  findReviewsByCourse: async (courseId: string) => {
    const response = await apiClient.get(`/review/course/${courseId}`);
    return response.data;
  },

  getCourseReviewStats: async (courseId: string) => {
    const response = await apiClient.get(`/review/course/${courseId}/stats`);
    return response.data;
  },
};

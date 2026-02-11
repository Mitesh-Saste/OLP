import axios from 'axios';
const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return api.request(error.config);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data) =>
    api.post('/auth/register', data),
  
  login: (data) =>
    api.post('/auth/login', data),
};

export const courseApi = {
  getCourses: (params) =>
    api.get('/courses', { params }),
  
  getCourse: (id) =>
    api.get(`/courses/${id}`),
  
  createCourse: (data) =>
    api.post('/courses', data),
  
  updateCourse: (id, data) =>
    api.put(`/courses/${id}`, data),
  
  deleteCourse: (id) =>
    api.delete(`/courses/${id}`),
  
  publishCourse: (id) =>
    api.post(`/courses/${id}/publish`),
  
  enrollInCourse: (id) =>
    api.post(`/courses/${id}/enroll`),
  
  getInstructorCourses: (params) =>
    api.get('/courses/instructor/my-courses', { params }),
  
  getCourseStudents: (id, params) =>
    api.get(`/courses/${id}/students`, { params }),
  
  getEnrolledCourses: (params) =>
    api.get('/courses/enrolled', { params }),
  
  getCourseProgress: (courseId) =>
    api.get(`/courses/${courseId}/progress`),
  
  addLesson: (courseId, data) =>
    api.post(`/courses/${courseId}/lessons`, data),
  
  updateLesson: (courseId, lessonId, data) =>
    api.put(`/courses/${courseId}/lessons/${lessonId}`, data),
  
  addLesson: (courseId, data) =>
    api.post(`/courses/${courseId}/lessons`, data),
  
  updateLesson: (courseId, lessonId, data) =>
    api.put(`/courses/${courseId}/lessons/${lessonId}`, data),
  
  deleteLesson: (courseId, lessonId) =>
    api.delete(`/courses/${courseId}/lessons/${lessonId}`),
  
  addSection: (courseId, data) =>
    api.post(`/courses/${courseId}/sections`, data),
  
  updateSection: (courseId, sectionId, data) =>
    api.put(`/courses/${courseId}/sections/${sectionId}`, data),
  
  deleteSection: (courseId, sectionId) =>
    api.delete(`/courses/${courseId}/sections/${sectionId}`),
};

export const lessonApi = {
  getLesson: (id) =>
    api.get(`/lessons/${id}`),
  
  getQuiz: (lessonId) =>
    api.get(`/lessons/${lessonId}/quiz`),
  
  submitQuiz: (lessonId, data) =>
    api.post(`/lessons/${lessonId}/quiz/submit`, data),
  
  getProgress: (courseId) =>
    api.get(`/courses/${courseId}/progress`),
};

export const quizApi = {
  createQuiz: (sectionId, data) =>
    api.post(`/quiz/section/${sectionId}`, data),
  
  getQuiz: (sectionId) =>
    api.get(`/quiz/section/${sectionId}`),
  
  deleteQuiz: (sectionId) =>
    api.delete(`/quiz/section/${sectionId}`),
  
  submitQuiz: (quizId, answers) =>
    api.post(`/quiz/${quizId}/submit`, answers),
  
  getQuizStatus: (quizId) =>
    api.get(`/quiz/${quizId}/status`),
};

export const progressApi = {
  getCourseProgress: (courseId) =>
    api.get(`/progress/course/${courseId}`),
  
  markLessonComplete: (lessonId) =>
    api.post(`/progress/lesson/${lessonId}/complete`),
};

export const courseService = {
  ...courseApi,
};

export const profileApi = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) =>
    api.put('/profile', data),
  changePassword: (data) =>
    api.put('/profile/password', data),
};

export const certificateApi = {
  checkAndGenerate: (courseId) => api.post(`/certificate/course/${courseId}`),
  getCertificate: (courseId) => api.get(`/certificate/course/${courseId}`),
};

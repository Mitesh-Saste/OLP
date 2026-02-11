import axios from 'axios';
import { AuthResponse, Course, Lesson, Quiz, QuizSubmission, QuizResult, Progress } from '../types';

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
    if (error.response?.status === 401) {
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
  register: (data: { username: string; email: string; password: string; role?: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  
  login: (data: { username: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
};

export const courseApi = {
  getCourses: (params?: { tag?: string; page?: number; size?: number }) =>
    api.get<{ content: Course[] }>('/courses', { params }),
  
  getCourse: (id: string) =>
    api.get<Course>(`/courses/${id}`),
  
  createCourse: (data: { title: string; description: string; tags: string[]; sections?: any[] }) =>
    api.post<Course>('/courses', data),
  
  updateCourse: (id: string, data: { title: string; description: string; tags: string[] }) =>
    api.put<Course>(`/courses/${id}`, data),
  
  deleteCourse: (id: string) =>
    api.delete(`/courses/${id}`),
  
  publishCourse: (id: string) =>
    api.post<Course>(`/courses/${id}/publish`),
  
  enrollInCourse: (id: string) =>
    api.post(`/courses/${id}/enroll`),
  
  getInstructorCourses: (params?: { page?: number; size?: number }) =>
    api.get<{ content: Course[] }>('/courses/instructor/my-courses', { params }),
  
  getCourseStudents: (id: string, params?: { page?: number; size?: number }) =>
    api.get<{ content: any[] }>(`/courses/${id}/students`, { params }),
  
  getEnrolledCourses: (params?: { page?: number; size?: number }) =>
    api.get<{ content: Course[] }>('/courses/enrolled', { params }),
  
  getCourseProgress: (courseId: string) =>
    api.get<Progress>(`/courses/${courseId}/progress`),
  
  addLesson: (courseId: string, data: { title: string; content: string; videoUrl: string; sortOrder: number }) =>
    api.post<Course>(`/courses/${courseId}/lessons`, data),
  
  updateLesson: (courseId: string, lessonId: string, data: { title: string; content: string; videoUrl: string; sortOrder: number }) =>
    api.put<Course>(`/courses/${courseId}/lessons/${lessonId}`, data),
  
  addLesson: (courseId: string, data: { title: string; content: string; videoUrl: string; sortOrder: number }) =>
    api.post<Course>(`/courses/${courseId}/lessons`, data),
  
  updateLesson: (courseId: string, lessonId: string, data: { title: string; content: string; videoUrl: string; sortOrder: number }) =>
    api.put<Course>(`/courses/${courseId}/lessons/${lessonId}`, data),
  
  deleteLesson: (courseId: string, lessonId: string) =>
    api.delete<Course>(`/courses/${courseId}/lessons/${lessonId}`),
  
  addSection: (courseId: string, data: { title: string; description: string; sortOrder: number }) =>
    api.post<Course>(`/courses/${courseId}/sections`, data),
  
  updateSection: (courseId: string, sectionId: string, data: { title: string; description: string; sortOrder: number }) =>
    api.put<Course>(`/courses/${courseId}/sections/${sectionId}`, data),
  
  deleteSection: (courseId: string, sectionId: string) =>
    api.delete<Course>(`/courses/${courseId}/sections/${sectionId}`),
};

export const lessonApi = {
  getLesson: (id: string) =>
    api.get<Lesson>(`/lessons/${id}`),
  
  getQuiz: (lessonId: string) =>
    api.get<Quiz>(`/lessons/${lessonId}/quiz`),
  
  submitQuiz: (lessonId: string, data: QuizSubmission) =>
    api.post<QuizResult>(`/lessons/${lessonId}/quiz/submit`, data),
  
  getProgress: (courseId: string) =>
    api.get<Progress>(`/courses/${courseId}/progress`),
};

export const quizApi = {
  createQuiz: (sectionId: string, data: any) =>
    api.post(`/quiz/section/${sectionId}`, data),
  
  getQuiz: (sectionId: string) =>
    api.get(`/quiz/section/${sectionId}`),
  
  deleteQuiz: (sectionId: string) =>
    api.delete(`/quiz/section/${sectionId}`),
  
  submitQuiz: (quizId: string, answers: Record<string, string>) =>
    api.post(`/quiz/${quizId}/submit`, answers),
  
  getQuizStatus: (quizId: string) =>
    api.get(`/quiz/${quizId}/status`),
};

export const progressApi = {
  getCourseProgress: (courseId: string) =>
    api.get(`/progress/course/${courseId}`),
  
  markLessonComplete: (lessonId: string) =>
    api.post(`/progress/lesson/${lessonId}/complete`),
};

export const courseService = {
  ...courseApi,
};

export const profileApi = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data: { firstName?: string; lastName?: string; email?: string; profilePicture?: string }) =>
    api.put('/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/profile/password', data),
};

export const certificateApi = {
  checkAndGenerate: (courseId: string) => api.post(`/certificate/course/${courseId}`),
  getCertificate: (courseId: string) => api.get(`/certificate/course/${courseId}`),
};
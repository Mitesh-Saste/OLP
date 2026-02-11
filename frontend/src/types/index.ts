export interface User {
  username: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

export interface Course {
  id: string;
  instructorId: string;
  instructorName?: string;
  title: string;
  description: string;
  isPublished: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  sections?: Section[];
}

export interface Section {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  sortOrder: number;
  lessons?: Lesson[];
  quiz?: {
    title: string;
    questions: {
      question: string;
      options: string[];
      correctAnswer: string;
    }[];
  } | null;
}

export interface Lesson {
  id: string;
  courseId: string;
  sectionId?: string;
  title: string;
  content: string;
  videoUrl?: string;
  sortOrder: number;
}

export interface Quiz {
  id: string;
  lessonId: string;
  questions: Question[];
}

export interface Question {
  id: string;
  prompt: string;
  points: number;
  options: Option[];
}

export interface Option {
  id: string;
  text: string;
}

export interface QuizSubmission {
  answers: Record<string, string>;
}

export interface QuizResult {
  attemptId: string;
  score: number;
  totalQuestions: number;
}

export interface Progress {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
  role: string;
}
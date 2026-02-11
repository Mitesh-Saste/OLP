-- V1__init.sql
-- Online Learning Platform Database Schema

-- Users table
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'INSTRUCTOR', 'ADMIN') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_username (username)
);

-- Courses table
CREATE TABLE courses (
    id CHAR(36) PRIMARY KEY,
    instructor_id CHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_courses_published_created (is_published, created_at),
    INDEX idx_courses_instructor (instructor_id)
);

-- Course tags table
CREATE TABLE course_tags (
    course_id CHAR(36) NOT NULL,
    tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (course_id, tag),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course_tags_tag (tag)
);

-- Lessons table
CREATE TABLE lessons (
    id CHAR(36) PRIMARY KEY,
    course_id CHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    video_url VARCHAR(500),
    sort_order INT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_lessons_course_order (course_id, sort_order)
);

-- Quizzes table
CREATE TABLE quizzes (
    id CHAR(36) PRIMARY KEY,
    lesson_id CHAR(36) NOT NULL,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY uk_quiz_lesson (lesson_id)
);

-- Quiz questions table
CREATE TABLE quiz_questions (
    id CHAR(36) PRIMARY KEY,
    quiz_id CHAR(36) NOT NULL,
    prompt TEXT NOT NULL,
    points INT DEFAULT 1,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_quiz_questions_quiz (quiz_id)
);

-- Quiz options table
CREATE TABLE quiz_options (
    id CHAR(36) PRIMARY KEY,
    question_id CHAR(36) NOT NULL,
    text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE,
    INDEX idx_quiz_options_question (question_id)
);

-- Enrollments table
CREATE TABLE enrollments (
    id CHAR(36) PRIMARY KEY,
    course_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_enrollment_course_user (course_id, user_id)
);

-- Quiz attempts table
CREATE TABLE quiz_attempts (
    id CHAR(36) PRIMARY KEY,
    quiz_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    answers JSON,
    score INT DEFAULT 0,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_quiz_attempts_quiz_user (quiz_id, user_id)
);

-- Lesson progress table
CREATE TABLE lesson_progress (
    id CHAR(36) PRIMARY KEY,
    lesson_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_lesson_progress_lesson_user (lesson_id, user_id)
);

-- Certificates table
CREATE TABLE certificates (
    id CHAR(36) PRIMARY KEY,
    course_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    certificate_url VARCHAR(500),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_certificate_course_user (course_id, user_id)
);
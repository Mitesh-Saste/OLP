# Online Learning Platform

A full-stack web application for online learning with courses, lessons, quizzes, and user management.

## Tech Stack

**Backend:**
- Java 21
- Spring Boot 3.x
- Spring Security (JWT)
- Spring Data JPA
- MySQL 8
- Flyway
- Gradle

**Frontend:**
- React 18
- TypeScript
- Vite
- Material-UI
- React Router
- Axios

## Prerequisites

- Java 21
- Node.js 18+
- MySQL 8 running on localhost:3306
- Git

## Database Setup

1. Start MySQL server on localhost:3306
2. Create the database:
```sql
CREATE DATABASE online_learning;
CREATE USER 'app'@'localhost' IDENTIFIED BY 'app';
GRANT ALL PRIVILEGES ON online_learning.* TO 'app'@'localhost';
FLUSH PRIVILEGES;
```

## Environment Variables

Copy `.env.example` and set your values:

```bash
# Database Configuration
DB_URL=jdbc:mysql://localhost:3306/online_learning
DB_USERNAME=app
DB_PASSWORD=app

# JWT Configuration
JWT_SECRET=mySecretKey123456789012345678901234567890
JWT_EXPIRY_ACCESS_MIN=15
JWT_EXPIRY_REFRESH_DAYS=7
```

## Running the Application

### Backend (Port 8080)

```bash
cd backend
./gradlew bootRun
```

### Frontend (Port 5173)

```bash
cd frontend
npm install
npm run dev
```

## Seeded Users

The application comes with pre-seeded test users:

| Username | Email | Password | Role |
|----------|-------|----------|------|
| admin | admin@example.com | Passw0rd! | ADMIN |
| instructor | inst@example.com | Passw0rd! | INSTRUCTOR |
| student | stud@example.com | Passw0rd! | STUDENT |

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Courses
- `GET /api/v1/courses` - Get courses (with pagination and tag filtering)
- `POST /api/v1/courses` - Create course (INSTRUCTOR only)
- `PUT /api/v1/courses/{id}` - Update course (owner or ADMIN)
- `POST /api/v1/courses/{id}/publish` - Publish course (ADMIN only)
- `POST /api/v1/courses/{id}/enroll` - Enroll in course (STUDENT only)

### Lessons & Quizzes
- `GET /api/v1/lessons/{id}` - Get lesson content
- `GET /api/v1/lessons/{id}/quiz` - Get quiz questions
- `POST /api/v1/lessons/{id}/quiz/submit` - Submit quiz answers
- `GET /api/v1/courses/{id}/progress` - Get course progress

## Sample API Calls

### 1. Register a new user
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com", 
    "password": "password123",
    "role": "STUDENT"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student",
    "password": "Passw0rd!"
  }'
```

### 3. Get courses (with token)
```bash
curl -X GET http://localhost:8080/api/v1/courses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Create course (as instructor)
```bash
curl -X POST http://localhost:8080/api/v1/courses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Programming Course",
    "description": "Learn programming fundamentals",
    "tags": ["programming", "beginner"]
  }'
```

### 5. Enroll in course (as student)
```bash
curl -X POST http://localhost:8080/api/v1/courses/COURSE_ID/enroll \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Get lesson
```bash
curl -X GET http://localhost:8080/api/v1/lessons/LESSON_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7. Submit quiz
```bash
curl -X POST http://localhost:8080/api/v1/lessons/LESSON_ID/quiz/submit \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "QUESTION_ID_1": "OPTION_ID_1",
      "QUESTION_ID_2": "OPTION_ID_2"
    }
  }'
```

## Features

- **User Management**: Registration, login, JWT authentication
- **Role-based Access**: Student, Instructor, Admin roles
- **Course Management**: Create, update, publish courses
- **Enrollment System**: Students can enroll in published courses
- **Lessons**: Rich content with video support
- **Quizzes**: Multiple choice questions with automatic grading
- **Progress Tracking**: Track lesson completion and course progress
- **Security**: JWT tokens, BCrypt password hashing, RBAC

## Project Structure

```
online-learning-platform/
├── backend/                 # Spring Boot application
│   ├── src/main/java/com/olp/
│   │   ├── entity/         # JPA entities
│   │   ├── repository/     # Data repositories
│   │   ├── service/        # Business logic
│   │   ├── controller/     # REST controllers
│   │   ├── dto/           # Data transfer objects
│   │   ├── config/        # Configuration classes
│   │   └── security/      # Security components
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/  # Flyway migrations
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── package.json
├── postman/               # API testing collection
├── .env.example          # Environment variables template
└── README.md
```

## Development Notes

- Backend runs on port 8080
- Frontend runs on port 5173
- Database migrations are handled by Flyway
- JWT tokens: 15min access, 7 days refresh
- CORS enabled for frontend origin
- All UUIDs stored as CHAR(36) in MySQL
- Quiz answers stored as JSON in MySQL
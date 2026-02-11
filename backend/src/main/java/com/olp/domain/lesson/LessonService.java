package com.olp.domain.lesson;

import com.olp.domain.lesson.LessonResponse;
import com.olp.domain.course.Course;
import com.olp.domain.lesson.Lesson;
import com.olp.domain.user.User;
import com.olp.domain.course.CourseRepository;
import com.olp.domain.enrollment.EnrollmentRepository;
import com.olp.domain.lesson.LessonRepository;
import com.olp.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class LessonService {

    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    public LessonService(LessonRepository lessonRepository, CourseRepository courseRepository, 
                        EnrollmentRepository enrollmentRepository, UserRepository userRepository) {
        this.lessonRepository = lessonRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
    }

    public LessonResponse getLesson(String lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(lesson.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Access control
        if (user.getRole() == User.Role.STUDENT) {
            if (!course.getIsPublished()) {
                throw new RuntimeException("Course is not published");
            }
            if (!enrollmentRepository.existsByCourseIdAndUserId(course.getId(), user.getId())) {
                throw new RuntimeException("Not enrolled in this course");
            }
        } else if (user.getRole() == User.Role.INSTRUCTOR) {
            if (!course.getInstructorId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
                throw new RuntimeException("Access denied");
            }
        }

        return mapToResponse(lesson);
    }

    private LessonResponse mapToResponse(Lesson lesson) {
        LessonResponse response = new LessonResponse();
        response.setId(lesson.getId());
        response.setCourseId(lesson.getCourseId());
        response.setTitle(lesson.getTitle());
        response.setContent(lesson.getContent());
        response.setVideoUrl(lesson.getVideoUrl());
        response.setSortOrder(lesson.getSortOrder());
        return response;
    }
}
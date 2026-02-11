package com.olp.service;

import com.olp.dto.CourseResponse;
import com.olp.entity.Course;
import com.olp.entity.Enrollment;
import com.olp.entity.User;
import com.olp.repository.CourseRepository;
import com.olp.repository.EnrollmentRepository;
import com.olp.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository, CourseRepository courseRepository, UserRepository userRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @PreAuthorize("hasRole('STUDENT')")
    public void enrollInCourse(String courseId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getIsPublished()) {
            throw new RuntimeException("Course is not published");
        }

        if (enrollmentRepository.existsByCourseIdAndUserId(courseId, user.getId())) {
            throw new RuntimeException("Already enrolled in this course");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setId(UUID.randomUUID().toString());
        enrollment.setCourseId(courseId);
        enrollment.setUserId(user.getId());

        enrollmentRepository.save(enrollment);
    }

    @PreAuthorize("hasRole('STUDENT')")
    public Page<CourseResponse> getEnrolledCourses(Pageable pageable) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> courseIds = enrollmentRepository.findCourseIdsByUserId(user.getId());
        Page<Course> courses = courseRepository.findByIdIn(courseIds, pageable);
        
        return courses.map(this::mapToResponse);
    }

    private CourseResponse mapToResponse(Course course) {
        CourseResponse response = new CourseResponse();
        response.setId(course.getId());
        response.setInstructorId(course.getInstructorId());
        response.setTitle(course.getTitle());
        response.setDescription(course.getDescription());
        response.setIsPublished(course.getIsPublished());
        response.setTags(course.getTags());
        response.setCreatedAt(course.getCreatedAt());
        response.setUpdatedAt(course.getUpdatedAt());
        return response;
    }
}
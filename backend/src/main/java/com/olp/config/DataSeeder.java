package com.olp.config;

import com.olp.entity.*;
import com.olp.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, CourseRepository courseRepository, 
                     LessonRepository lessonRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Data already seeded
        }

        // Create users
        User admin = createUser("admin", "admin@example.com", "Passw0rd!", User.Role.ADMIN);
        User instructor = createUser("instructor", "inst@example.com", "Passw0rd!", User.Role.INSTRUCTOR);
        User student = createUser("student", "stud@example.com", "Passw0rd!", User.Role.STUDENT);

        // Create published course
        Course publishedCourse = createCourse(instructor.getId(), "Introduction to Programming", 
                "Learn the basics of programming", true, Set.of("programming", "beginner"));

        // Create lesson
        Lesson lesson = createLesson(publishedCourse.getId(), "Variables and Data Types", 
                "Learn about variables and different data types in programming", 
                "https://example.com/video1", 1);

        // Create draft course
        createCourse(instructor.getId(), "Advanced Java Programming", 
                "Deep dive into Java programming concepts", false, Set.of("java", "advanced"));
    }

    private User createUser(String username, String email, String password, User.Role role) {
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        return userRepository.save(user);
    }

    private Course createCourse(String instructorId, String title, String description, boolean published, Set<String> tags) {
        Course course = new Course();
        course.setId(UUID.randomUUID().toString());
        course.setInstructorId(instructorId);
        course.setTitle(title);
        course.setDescription(description);
        course.setIsPublished(published);
        course.setTags(tags);
        return courseRepository.save(course);
    }

    private Lesson createLesson(String courseId, String title, String content, String videoUrl, int sortOrder) {
        Lesson lesson = new Lesson();
        lesson.setId(UUID.randomUUID().toString());
        lesson.setCourseId(courseId);
        lesson.setTitle(title);
        lesson.setContent(content);
        lesson.setVideoUrl(videoUrl);
        lesson.setSortOrder(sortOrder);
        return lessonRepository.save(lesson);
    }


}
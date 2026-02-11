package com.olp.service;

import com.olp.entity.*;
import com.olp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonProgressRepository progressRepository;
    private final SectionQuizRepository quizRepository;
    private final QuizAttemptRepository attemptRepository;
    private final SectionRepository sectionRepository;
    private final LessonRepository lessonRepository;

    @Autowired
    public CertificateService(CertificateRepository certificateRepository, UserRepository userRepository,
                             CourseRepository courseRepository, LessonProgressRepository progressRepository,
                             SectionQuizRepository quizRepository, QuizAttemptRepository attemptRepository,
                             SectionRepository sectionRepository, LessonRepository lessonRepository) {
        this.certificateRepository = certificateRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.progressRepository = progressRepository;
        this.quizRepository = quizRepository;
        this.attemptRepository = attemptRepository;
        this.sectionRepository = sectionRepository;
        this.lessonRepository = lessonRepository;
    }

    @Transactional
    public Map<String, Object> checkAndGenerateCertificate(String courseId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        // Check if certificate already exists
        List<Certificate> existing = certificateRepository.findByUserIdAndCourseId(user.getId(), courseId);
        if (!existing.isEmpty()) {
            return getCertificateData(existing.get(0));
        }

        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));
        List<Section> sections = sectionRepository.findByCourseIdOrderBySortOrder(courseId);

        if (sections.isEmpty()) {
            return Map.of("eligible", false, "reason", "Course has no sections");
        }

        // Check if all lessons completed
        List<String> lessonIds = new ArrayList<>();
        for (Section section : sections) {
            lessonIds.addAll(lessonRepository.findBySectionIdOrderBySortOrder(section.getId())
                    .stream().map(Lesson::getId).toList());
        }
        
        if (lessonIds.isEmpty()) {
            return Map.of("eligible", false, "reason", "Course has no lessons");
        }
        
        long totalLessons = lessonIds.size();
        long completedLessons = progressRepository.findByUserIdAndLessonIdIn(user.getId(), lessonIds).size();

        if (completedLessons < totalLessons) {
            return Map.of("eligible", false, "reason", "Not all lessons completed");
        }

        // Check if all quizzes passed with >= 60%
        List<String> quizIds = new ArrayList<>();
        for (Section section : sections) {
            quizRepository.findBySectionId(section.getId()).ifPresent(quiz -> quizIds.add(quiz.getId()));
        }

        if (!quizIds.isEmpty()) {
            for (String quizId : quizIds) {
                List<QuizAttempt> attempts = attemptRepository.findByUserIdAndQuizIdIn(user.getId(), List.of(quizId));
                boolean passed = attempts.stream().anyMatch(QuizAttempt::getPassed);
                if (!passed) {
                    return Map.of("eligible", false, "reason", "Not all quizzes passed with 60% or above");
                }
            }
        }

        // Generate certificate
        Certificate certificate = new Certificate();
        certificate.setId(UUID.randomUUID().toString());
        certificate.setUserId(user.getId());
        certificate.setCourseId(courseId);
        certificate.setCertificateNumber(generateCertificateNumber());
        certificateRepository.save(certificate);

        return getCertificateData(certificate);
    }

    public Map<String, Object> getCertificate(String courseId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        List<Certificate> certificates = certificateRepository.findByUserIdAndCourseId(user.getId(), courseId);
        if (certificates.isEmpty()) {
            throw new RuntimeException("Certificate not found");
        }

        return getCertificateData(certificates.get(0));
    }

    private Map<String, Object> getCertificateData(Certificate certificate) {
        User user = userRepository.findById(certificate.getUserId()).orElseThrow();
        Course course = courseRepository.findById(certificate.getCourseId()).orElseThrow();
        User instructor = userRepository.findById(course.getInstructorId()).orElseThrow();

        Map<String, Object> data = new HashMap<>();
        data.put("eligible", true);
        data.put("certificateNumber", certificate.getCertificateNumber());
        data.put("studentName", (user.getFirstName() != null ? user.getFirstName() + " " + user.getLastName() : user.getUsername()));
        data.put("instructorName", (instructor.getFirstName() != null ? instructor.getFirstName() + " " + instructor.getLastName() : instructor.getUsername()));
        data.put("courseName", course.getTitle());
        data.put("issueDate", certificate.getIssueDate().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")));
        return data;
    }

    private String generateCertificateNumber() {
        return "RSCOE-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
    }
}

package com.olp.service;

import com.olp.dto.CourseRequest;
import com.olp.dto.CourseResponse;
import com.olp.dto.LessonRequest;
import com.olp.dto.SectionRequest;
import com.olp.dto.SectionResponse;
import com.olp.entity.Course;
import com.olp.entity.Lesson;
import com.olp.entity.Section;
import com.olp.entity.User;
import com.olp.repository.CourseRepository;
import com.olp.repository.EnrollmentRepository;
import com.olp.repository.LessonRepository;
import com.olp.repository.SectionRepository;
import com.olp.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;

@Service
// @RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final SectionRepository sectionRepository;
    @Autowired
    public CourseService(CourseRepository courseRepository, UserRepository userRepository,
            EnrollmentRepository enrollmentRepository, LessonRepository lessonRepository,
            SectionRepository sectionRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.lessonRepository = lessonRepository;
        this.sectionRepository = sectionRepository;
    }

    public Page<CourseResponse> getCourses(String tag, Pageable pageable) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Page<Course> courses;
        if (user.getRole() == User.Role.STUDENT) {
            courses = tag != null ? 
                courseRepository.findByIsPublishedTrueAndTagsContaining(tag, pageable) :
                courseRepository.findByIsPublishedTrue(pageable);
        } else {
            courses = courseRepository.findAll(pageable);
        }

        return courses.map(this::mapToResponse);
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    public CourseResponse createCourse(CourseRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = new Course();
        course.setId(UUID.randomUUID().toString());
        course.setInstructorId(user.getId());
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setTags(request.getTags());
        course.setIsPublished(false);

        course = courseRepository.save(course);
        
        // Create sections if provided
        if (request.getSections() != null && !request.getSections().isEmpty()) {
            createSectionsForCourse(course.getId(), request.getSections());
        }
        
        return mapToResponse(course);
    }

    public CourseResponse updateCourse(String courseId, CourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != User.Role.ADMIN && !course.getInstructorId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setTags(request.getTags());

        course = courseRepository.save(course);
        return mapToResponse(course);
    }

    public CourseResponse publishCourse(String courseId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Allow both ADMIN and course owner (INSTRUCTOR) to publish
        if (user.getRole() != User.Role.ADMIN && !course.getInstructorId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        course.setIsPublished(true);
        course = courseRepository.save(course);
        return mapToResponse(course);
    }

    public CourseResponse getCourse(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return mapToResponse(course);
    }

    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Page<CourseResponse> getInstructorCourses(Pageable pageable) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Page<Course> courses = courseRepository.findByInstructorId(user.getId(), pageable);
        return courses.map(this::mapToResponse);
    }

    public Page<Map<String, Object>> getCourseStudents(String courseId, Pageable pageable) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (user.getRole() != User.Role.ADMIN && !course.getInstructorId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        List<String> studentIds = enrollmentRepository.findUserIdsByCourseId(courseId);
        
        if (studentIds.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }
        
        List<User> students = userRepository.findByIdIn(studentIds);
        
        List<Map<String, Object>> studentData = students.stream()
                .map(student -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", student.getId());
                    map.put("username", student.getUsername());
                    map.put("email", student.getEmail());
                    return map;
                })
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), studentData.size());
        List<Map<String, Object>> pageContent = studentData.subList(start, end);
        
        return new PageImpl<>(pageContent, pageable, studentData.size());
    }

    private void createSectionsForCourse(String courseId, List<SectionRequest> sectionRequests) {
        for (SectionRequest sectionRequest : sectionRequests) {
            Section section = new Section();
            section.setId(UUID.randomUUID().toString());
            section.setCourseId(courseId);
            section.setTitle(sectionRequest.getTitle());
            section.setDescription(sectionRequest.getDescription());
            section.setSortOrder(sectionRequest.getSortOrder());
            section = sectionRepository.save(section);
            
            // Create lessons for this section
            if (sectionRequest.getLessons() != null && !sectionRequest.getLessons().isEmpty()) {
                createLessonsForSection(section.getId(), courseId, sectionRequest.getLessons());
            }
        }
    }

    private void createLessonsForSection(String sectionId, String courseId, List<LessonRequest> lessonRequests) {
        for (LessonRequest lessonRequest : lessonRequests) {
            Lesson lesson = new Lesson();
            lesson.setId(UUID.randomUUID().toString());
            lesson.setCourseId(courseId);
            lesson.setSectionId(sectionId);
            lesson.setTitle(lessonRequest.getTitle());
            lesson.setContent(lessonRequest.getContent());
            lesson.setVideoUrl(lessonRequest.getVideoUrl());
            lesson.setSortOrder(lessonRequest.getSortOrder());
            lessonRepository.save(lesson);
        }
    }

    private CourseResponse mapToResponse(Course course) {
        CourseResponse response = new CourseResponse();
        response.setId(course.getId());
        response.setInstructorId(course.getInstructorId());
        
        // Get instructor name
        userRepository.findById(course.getInstructorId()).ifPresent(instructor -> {
            String instructorName = instructor.getFirstName() != null && instructor.getLastName() != null
                ? instructor.getFirstName() + " " + instructor.getLastName()
                : instructor.getUsername();
            response.setInstructorName(instructorName);
        });
        
        response.setTitle(course.getTitle());
        response.setDescription(course.getDescription());
        response.setIsPublished(course.getIsPublished());
        response.setTags(course.getTags());
        response.setCreatedAt(course.getCreatedAt());
        response.setUpdatedAt(course.getUpdatedAt());
        
        // Load sections with lessons
        List<Section> sections = sectionRepository.findByCourseIdOrderBySortOrder(course.getId());
        response.setSections(sections.stream().map(this::mapSectionToResponse).collect(Collectors.toList()));
        
        return response;
    }

    private SectionResponse mapSectionToResponse(Section section) {
        SectionResponse response = new SectionResponse();
        response.setId(section.getId());
        response.setCourseId(section.getCourseId());
        response.setTitle(section.getTitle());
        response.setDescription(section.getDescription());
        response.setSortOrder(section.getSortOrder());
        
        // Load lessons for this section
        List<Lesson> lessons = lessonRepository.findBySectionIdOrderBySortOrder(section.getId());
        response.setLessons(lessons.stream().map(this::mapLessonToResponse).collect(Collectors.toList()));
        
        return response;
    }

    private com.olp.dto.LessonResponse mapLessonToResponse(Lesson lesson) {
        com.olp.dto.LessonResponse response = new com.olp.dto.LessonResponse();
        response.setId(lesson.getId());
        response.setCourseId(lesson.getCourseId());
        response.setTitle(lesson.getTitle());
        response.setContent(lesson.getContent());
        response.setVideoUrl(lesson.getVideoUrl());
        response.setSortOrder(lesson.getSortOrder());
        return response;
    }

    public CourseResponse addLessonToCourse(String courseId, LessonRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (user.getRole() != User.Role.ADMIN && !course.getInstructorId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        Lesson lesson = new Lesson();
        lesson.setId(UUID.randomUUID().toString());
        lesson.setCourseId(courseId);
        lesson.setSectionId(request.getSectionId());
        lesson.setTitle(request.getTitle());
        lesson.setContent(request.getContent());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setSortOrder(request.getSortOrder());
        lessonRepository.save(lesson);

        return mapToResponse(course);
    }

    public CourseResponse updateLesson(String courseId, String lessonId, LessonRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (user.getRole() != User.Role.ADMIN && !course.getInstructorId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        lesson.setTitle(request.getTitle());
        lesson.setContent(request.getContent());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setSortOrder(request.getSortOrder());
        if (request.getSectionId() != null) {
            lesson.setSectionId(request.getSectionId());
        }
        lessonRepository.save(lesson);

        return mapToResponse(course);
    }

    @Transactional
    public CourseResponse deleteLesson(String courseId, String lessonId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (user.getRole() != User.Role.ADMIN && !course.getInstructorId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        lessonRepository.deleteById(lessonId);
        return mapToResponse(course);
    }

    public CourseResponse addSectionToCourse(String courseId, SectionRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (user.getRole() != User.Role.ADMIN && !course.getInstructorId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        Section section = new Section();
        section.setId(UUID.randomUUID().toString());
        section.setCourseId(courseId);
        section.setTitle(request.getTitle());
        section.setDescription(request.getDescription());
        section.setSortOrder(request.getSortOrder());
        sectionRepository.save(section);

        return mapToResponse(course);
    }

    public CourseResponse updateSection(String courseId, String sectionId, SectionRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (user.getRole() != User.Role.ADMIN && !course.getInstructorId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        section.setTitle(request.getTitle());
        section.setDescription(request.getDescription());
        section.setSortOrder(request.getSortOrder());
        sectionRepository.save(section);

        return mapToResponse(course);
    }

    @Transactional
    public CourseResponse deleteSection(String courseId, String sectionId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (user.getRole() != User.Role.ADMIN && !course.getInstructorId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        lessonRepository.deleteBySectionId(sectionId);
        sectionRepository.deleteById(sectionId);
        return mapToResponse(course);
    }

    @Transactional
    public void deleteCourse(String courseId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (user.getRole() != User.Role.ADMIN && !course.getInstructorId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        // Delete all lessons in all sections
        List<Section> sections = sectionRepository.findByCourseIdOrderBySortOrder(courseId);
        for (Section section : sections) {
            lessonRepository.deleteBySectionId(section.getId());
        }
        
        // Delete all sections
        sectionRepository.deleteByCourseId(courseId);
        
        // Delete all enrollments
        enrollmentRepository.deleteByCourseId(courseId);
        
        // Delete the course
        courseRepository.deleteById(courseId);
    }
}
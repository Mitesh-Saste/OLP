package com.olp.controller;

import com.olp.dto.CourseRequest;
import com.olp.dto.CourseResponse;
import com.olp.dto.LessonRequest;
import com.olp.service.CourseService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

    private final CourseService courseService;

    @Autowired
    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<Page<CourseResponse>> getCourses(
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(courseService.getCourses(tag, pageable));
    }

    @PostMapping
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.createCourse(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> updateCourse(@PathVariable String id, @Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.updateCourse(id, request));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<CourseResponse> publishCourse(@PathVariable String id) {
        return ResponseEntity.ok(courseService.publishCourse(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourse(@PathVariable String id) {
        return ResponseEntity.ok(courseService.getCourse(id));
    }

    @GetMapping("/instructor/my-courses")
    public ResponseEntity<Page<CourseResponse>> getInstructorCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(courseService.getInstructorCourses(pageable));
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<Page<Map<String, Object>>> getCourseStudents(
            @PathVariable String id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(courseService.getCourseStudents(id, pageable));
    }

    @PostMapping("/{id}/lessons")
    public ResponseEntity<CourseResponse> addLesson(
            @PathVariable String id,
            @Valid @RequestBody LessonRequest request) {
        return ResponseEntity.ok(courseService.addLessonToCourse(id, request));
    }

    @PutMapping("/{courseId}/lessons/{lessonId}")
    public ResponseEntity<CourseResponse> updateLesson(
            @PathVariable String courseId,
            @PathVariable String lessonId,
            @Valid @RequestBody LessonRequest request) {
        return ResponseEntity.ok(courseService.updateLesson(courseId, lessonId, request));
    }

    @DeleteMapping("/{courseId}/lessons/{lessonId}")
    public ResponseEntity<CourseResponse> deleteLesson(
            @PathVariable String courseId,
            @PathVariable String lessonId) {
        return ResponseEntity.ok(courseService.deleteLesson(courseId, lessonId));
    }

    @PostMapping("/{courseId}/sections")
    public ResponseEntity<CourseResponse> addSection(
            @PathVariable String courseId,
            @Valid @RequestBody com.olp.dto.SectionRequest request) {
        return ResponseEntity.ok(courseService.addSectionToCourse(courseId, request));
    }

    @PutMapping("/{courseId}/sections/{sectionId}")
    public ResponseEntity<CourseResponse> updateSection(
            @PathVariable String courseId,
            @PathVariable String sectionId,
            @Valid @RequestBody com.olp.dto.SectionRequest request) {
        return ResponseEntity.ok(courseService.updateSection(courseId, sectionId, request));
    }

    @DeleteMapping("/{courseId}/sections/{sectionId}")
    public ResponseEntity<CourseResponse> deleteSection(
            @PathVariable String courseId,
            @PathVariable String sectionId) {
        return ResponseEntity.ok(courseService.deleteSection(courseId, sectionId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable String id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
}
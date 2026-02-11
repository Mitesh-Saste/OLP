package com.olp.controller;

import com.olp.dto.ProgressResponse;
import com.olp.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/progress")
public class ProgressController {

    private final ProgressService progressService;

    @Autowired
    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ProgressResponse> getCourseProgress(@PathVariable String courseId) {
        return ResponseEntity.ok(progressService.getCourseProgress(courseId));
    }

    @PostMapping("/lesson/{lessonId}/complete")
    public ResponseEntity<Void> markLessonComplete(@PathVariable String lessonId) {
        progressService.markLessonComplete(lessonId);
        return ResponseEntity.ok().build();
    }
}
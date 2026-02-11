package com.olp.controller;

import com.olp.dto.LessonResponse;
import com.olp.dto.ProgressResponse;
import com.olp.dto.QuizResponse;
import com.olp.dto.QuizSubmissionRequest;
import com.olp.dto.QuizSubmissionResponse;
import com.olp.service.LessonService;
import com.olp.service.ProgressService;
import com.olp.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class LessonController {

    private final LessonService lessonService;
    private final QuizService quizService;
    private final ProgressService progressService;

    public LessonController(LessonService lessonService, QuizService quizService, ProgressService progressService) {
        this.lessonService = lessonService;
        this.quizService = quizService;
        this.progressService = progressService;
    }

    @GetMapping("/lessons/{id}")
    public ResponseEntity<LessonResponse> getLesson(@PathVariable String id) {
        return ResponseEntity.ok(lessonService.getLesson(id));
    }

    @GetMapping("/lessons/{id}/quiz")
    public ResponseEntity<?> getQuiz(@PathVariable String id) {
        return ResponseEntity.ok(quizService.getQuiz(id));
    }

    @PostMapping("/lessons/{id}/quiz/submit")
    public ResponseEntity<?> submitQuiz(@PathVariable String id, @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(quizService.submitQuiz(id, request));
    }

    @GetMapping("/courses/{id}/progress")
    public ResponseEntity<ProgressResponse> getCourseProgress(@PathVariable String id) {
        return ResponseEntity.ok(progressService.getCourseProgress(id));
    }
}
package com.olp.domain.lesson;

import com.olp.domain.lesson.LessonResponse;
import com.olp.domain.progress.ProgressResponse;
import com.olp.domain.quiz.QuizResponse;
import com.olp.domain.quiz.QuizSubmissionRequest;
import com.olp.domain.quiz.QuizSubmissionResponse;
import com.olp.domain.lesson.LessonService;
import com.olp.domain.progress.ProgressService;
import com.olp.domain.quiz.QuizService;
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
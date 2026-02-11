package com.olp.domain.quiz;

import com.olp.domain.quiz.QuizRequest;
import com.olp.domain.quiz.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/quiz")
public class QuizController {

    private final QuizService quizService;

    @Autowired
    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping("/section/{sectionId}")
    public ResponseEntity<Void> createQuiz(@PathVariable String sectionId, @RequestBody QuizRequest request) {
        quizService.createQuiz(sectionId, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/section/{sectionId}")
    public ResponseEntity<Map<String, Object>> getQuiz(@PathVariable String sectionId) {
        return ResponseEntity.ok(quizService.getQuiz(sectionId));
    }

    @PostMapping("/{quizId}/submit")
    public ResponseEntity<Map<String, Object>> submitQuiz(@PathVariable String quizId, @RequestBody Map<String, String> answers) {
        return ResponseEntity.ok(quizService.submitQuiz(quizId, answers));
    }

    @GetMapping("/{quizId}/status")
    public ResponseEntity<Map<String, Object>> getQuizStatus(@PathVariable String quizId) {
        return ResponseEntity.ok(quizService.getQuizStatus(quizId));
    }

    @DeleteMapping("/section/{sectionId}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable String sectionId) {
        quizService.deleteQuiz(sectionId);
        return ResponseEntity.ok().build();
    }
}
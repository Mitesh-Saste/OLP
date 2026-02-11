package com.olp.domain.progress;

import com.olp.domain.progress.ProgressResponse;
import com.olp.domain.lesson.Lesson;
import com.olp.domain.progress.LessonProgress;
import com.olp.domain.user.User;
import com.olp.domain.quiz.SectionQuiz;
import com.olp.domain.quiz.QuizAttempt;
import com.olp.domain.progress.LessonProgressRepository;
import com.olp.domain.lesson.LessonRepository;
import com.olp.domain.user.UserRepository;
import com.olp.domain.quiz.SectionQuizRepository;
import com.olp.domain.quiz.QuizAttemptRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProgressService {

    private final LessonRepository lessonRepository;
    private final LessonProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final SectionQuizRepository quizRepository;
    private final QuizAttemptRepository attemptRepository;

    public ProgressService(LessonRepository lessonRepository, LessonProgressRepository progressRepository, 
                          UserRepository userRepository, SectionQuizRepository quizRepository, 
                          QuizAttemptRepository attemptRepository) {
        this.lessonRepository = lessonRepository;
        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
        this.quizRepository = quizRepository;
        this.attemptRepository = attemptRepository;
    }

    public ProgressResponse getCourseProgress(String courseId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Lesson> lessons = lessonRepository.findByCourseIdOrderBySortOrder(courseId);
        List<String> lessonIds = lessons.stream().map(Lesson::getId).collect(Collectors.toList());
        
        List<LessonProgress> completedProgress = progressRepository.findByUserIdAndLessonIdIn(user.getId(), lessonIds);
        long completedLessons = completedProgress.stream().filter(LessonProgress::getCompleted).count();

        // Get quizzes for the course sections
        List<SectionQuiz> quizzes = quizRepository.findByCourseId(courseId);
        List<String> quizIds = quizzes.stream().map(SectionQuiz::getId).collect(Collectors.toList());
        
        // Count passed quizzes (score >= 50%)
        long passedQuizzes = 0;
        if (!quizIds.isEmpty()) {
            List<QuizAttempt> attempts = attemptRepository.findByUserIdAndQuizIdIn(user.getId(), quizIds);
            passedQuizzes = attempts.stream()
                .filter(attempt -> (double) attempt.getScore() / attempt.getTotalQuestions() * 100 >= 50.0)
                .map(QuizAttempt::getQuizId)
                .distinct()
                .count();
        }

        int totalItems = lessons.size() + quizzes.size();
        int completedItems = (int) (completedLessons + passedQuizzes);

        ProgressResponse response = new ProgressResponse();
        response.setCourseId(courseId);
        response.setCompletedLessons(completedItems);
        response.setTotalLessons(totalItems);
        response.setProgressPercent(totalItems > 0 ? (double) completedItems / totalItems * 100 : 0.0);
        response.setCompletedLessonIds(completedProgress.stream()
            .filter(LessonProgress::getCompleted)
            .map(LessonProgress::getLessonId)
            .collect(Collectors.toList()));

        return response;
    }

    public void markLessonComplete(String lessonId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if lesson belongs to a section with a quiz
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        
        if (lesson.getSectionId() != null) {
            // Check if section has a quiz and if it's passed
            // This will be implemented when quiz integration is complete
        }

        List<LessonProgress> existingProgress = progressRepository.findByUserIdAndLessonIdIn(user.getId(), List.of(lessonId));
        LessonProgress progress = existingProgress.isEmpty() ? new LessonProgress() : existingProgress.get(0);
        
        if (progress.getId() == null) {
            progress.setId(java.util.UUID.randomUUID().toString());
            progress.setUserId(user.getId());
            progress.setLessonId(lessonId);
        }
        
        progress.setCompleted(true);
        progress.setCompletedAt(java.time.LocalDateTime.now());
        progressRepository.save(progress);
    }
}
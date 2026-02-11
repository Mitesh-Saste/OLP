package com.olp.domain.quiz;

import com.olp.domain.quiz.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, String> {
    Optional<QuizAttempt> findByQuizIdAndUserIdAndPassedTrue(String quizId, String userId);
    List<QuizAttempt> findByUserIdAndQuizIdIn(String userId, List<String> quizIds);
}
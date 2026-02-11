package com.olp.repository;

import com.olp.entity.QuizOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizOptionRepository extends JpaRepository<QuizOption, String> {
    List<QuizOption> findByQuestionId(String questionId);
}
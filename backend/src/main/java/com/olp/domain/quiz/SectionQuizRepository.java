package com.olp.domain.quiz;

import com.olp.domain.quiz.SectionQuiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SectionQuizRepository extends JpaRepository<SectionQuiz, String> {
    Optional<SectionQuiz> findBySectionId(String sectionId);
    
    @Query("SELECT sq FROM SectionQuiz sq WHERE sq.sectionId IN (SELECT s.id FROM Section s WHERE s.courseId = :courseId)")
    List<SectionQuiz> findByCourseId(String courseId);
}
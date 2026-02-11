package com.olp.domain.progress;

import com.olp.domain.progress.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, String> {
    List<LessonProgress> findByUserIdAndLessonIdIn(String userId, List<String> lessonIds);
}
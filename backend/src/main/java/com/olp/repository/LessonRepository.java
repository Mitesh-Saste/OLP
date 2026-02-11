package com.olp.repository;

import com.olp.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, String> {
    List<Lesson> findByCourseIdOrderBySortOrder(String courseId);
    List<Lesson> findBySectionIdOrderBySortOrder(String sectionId);
    void deleteByCourseId(String courseId);
    void deleteBySectionId(String sectionId);
}
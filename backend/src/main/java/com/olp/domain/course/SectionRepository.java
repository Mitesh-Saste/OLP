package com.olp.domain.course;

import com.olp.domain.course.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface SectionRepository extends JpaRepository<Section, String> {
    List<Section> findByCourseIdOrderBySortOrder(String courseId);
    
    @Modifying
    @Transactional
    void deleteByCourseId(String courseId);
}
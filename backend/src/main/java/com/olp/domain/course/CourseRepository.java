package com.olp.domain.course;

import com.olp.domain.course.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {
    Page<Course> findByIsPublishedTrue(Pageable pageable);
    
    @Query("SELECT c FROM Course c JOIN c.tags t WHERE c.isPublished = true AND t = :tag")
    Page<Course> findByIsPublishedTrueAndTagsContaining(@Param("tag") String tag, Pageable pageable);
    
    Page<Course> findByInstructorId(String instructorId, Pageable pageable);
    
    Page<Course> findByIdIn(List<String> ids, Pageable pageable);
}
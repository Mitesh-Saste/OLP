package com.olp.domain.enrollment;

import com.olp.domain.enrollment.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, String> {
    Optional<Enrollment> findByCourseIdAndUserId(String courseId, String userId);
    List<Enrollment> findByUserId(String userId);
    boolean existsByCourseIdAndUserId(String courseId, String userId);
    
    @Query("SELECT e.courseId FROM Enrollment e WHERE e.userId = :userId")
    List<String> findCourseIdsByUserId(@Param("userId") String userId);
    
    @Query("SELECT e.userId FROM Enrollment e WHERE e.courseId = :courseId")
    List<String> findUserIdsByCourseId(@Param("courseId") String courseId);
    
    @Modifying
    @Transactional
    void deleteByCourseId(String courseId);
}
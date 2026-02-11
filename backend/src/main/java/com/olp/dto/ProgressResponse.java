package com.olp.dto;

import java.util.List;

public class ProgressResponse {
    private String courseId;
    private Integer completedLessons;
    private Integer totalLessons;
    private Double progressPercent;
    private List<String> completedLessonIds;

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public Integer getCompletedLessons() { return completedLessons; }
    public void setCompletedLessons(Integer completedLessons) { this.completedLessons = completedLessons; }
    public Integer getTotalLessons() { return totalLessons; }
    public void setTotalLessons(Integer totalLessons) { this.totalLessons = totalLessons; }
    public Double getProgressPercent() { return progressPercent; }
    public void setProgressPercent(Double progressPercent) { this.progressPercent = progressPercent; }
    public List<String> getCompletedLessonIds() { return completedLessonIds; }
    public void setCompletedLessonIds(List<String> completedLessonIds) { this.completedLessonIds = completedLessonIds; }
}
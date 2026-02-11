package com.olp.dto;

import java.util.List;

public class SectionResponse {
    private String id;
    private String courseId;
    private String title;
    private String description;
    private Integer sortOrder;
    private List<LessonResponse> lessons;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public List<LessonResponse> getLessons() { return lessons; }
    public void setLessons(List<LessonResponse> lessons) { this.lessons = lessons; }
}
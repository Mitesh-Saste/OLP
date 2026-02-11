package com.olp.domain.course;

import com.olp.domain.lesson.LessonRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class SectionRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;
    
    private String description;
    private Integer sortOrder;
    private List<LessonRequest> lessons;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public List<LessonRequest> getLessons() { return lessons; }
    public void setLessons(List<LessonRequest> lessons) { this.lessons = lessons; }
}
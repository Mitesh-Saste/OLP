package com.olp.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "quizzes")
public class Quiz {
    @Id
    @Column(length = 36, columnDefinition = "CHAR(36)")
    private String id;

    @Column(name = "lesson_id", nullable = false, length = 36)
    private String lessonId;

    public Quiz() {}
    
    public Quiz(String id, String lessonId) {
        this.id = id;
        this.lessonId = lessonId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getLessonId() { return lessonId; }
    public void setLessonId(String lessonId) { this.lessonId = lessonId; }
}
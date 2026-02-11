package com.olp.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "quiz_option")
public class QuizOption {
    @Id
    @Column(length = 36, columnDefinition = "CHAR(36)")
    private String id;

    @Column(name = "question_id", nullable = false, length = 36)
    private String questionId;

    @Column(nullable = false)
    private String optionText;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }
    public String getOptionText() { return optionText; }
    public void setOptionText(String optionText) { this.optionText = optionText; }
}
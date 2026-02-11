package com.olp.domain.quiz;

public class QuizSubmissionResponse {
    private String attemptId;
    private Integer score;
    private Integer totalQuestions;

    public QuizSubmissionResponse() {}
    
    public QuizSubmissionResponse(String attemptId, Integer score, Integer totalQuestions) {
        this.attemptId = attemptId;
        this.score = score;
        this.totalQuestions = totalQuestions;
    }

    public String getAttemptId() { return attemptId; }
    public void setAttemptId(String attemptId) { this.attemptId = attemptId; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }
}
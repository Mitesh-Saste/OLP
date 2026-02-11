package com.olp.domain.quiz;

import java.util.Map;

public class QuizSubmissionRequest {
    private Map<String, String> answers;

    public Map<String, String> getAnswers() { return answers; }
    public void setAnswers(Map<String, String> answers) { this.answers = answers; }
}
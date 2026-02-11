package com.olp.domain.quiz;

import java.util.List;

public class QuizRequest {
    private String title;
    private List<QuestionRequest> questions;

    public static class QuestionRequest {
        private String question;
        private List<String> options;
        private String correctAnswer;

        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }
        public String getCorrectAnswer() { return correctAnswer; }
        public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public List<QuestionRequest> getQuestions() { return questions; }
    public void setQuestions(List<QuestionRequest> questions) { this.questions = questions; }
}
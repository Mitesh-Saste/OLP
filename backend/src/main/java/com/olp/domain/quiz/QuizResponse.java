package com.olp.domain.quiz;

import java.util.List;

public class QuizResponse {
    private String id;
    private String lessonId;
    private List<QuestionResponse> questions;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getLessonId() { return lessonId; }
    public void setLessonId(String lessonId) { this.lessonId = lessonId; }
    public List<QuestionResponse> getQuestions() { return questions; }
    public void setQuestions(List<QuestionResponse> questions) { this.questions = questions; }

    public static class QuestionResponse {
        private String id;
        private String prompt;
        private Integer points;
        private List<OptionResponse> options;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getPrompt() { return prompt; }
        public void setPrompt(String prompt) { this.prompt = prompt; }
        public Integer getPoints() { return points; }
        public void setPoints(Integer points) { this.points = points; }
        public List<OptionResponse> getOptions() { return options; }
        public void setOptions(List<OptionResponse> options) { this.options = options; }
    }

    public static class OptionResponse {
        private String id;
        private String text;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
    }
}
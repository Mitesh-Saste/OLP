package com.olp.domain.quiz;

import com.olp.domain.user.User;
import com.olp.domain.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class QuizService {

    private final SectionQuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizOptionRepository optionRepository;
    private final QuizAttemptRepository attemptRepository;
    private final UserRepository userRepository;

    @Autowired
    public QuizService(SectionQuizRepository quizRepository, QuizQuestionRepository questionRepository, 
                      QuizOptionRepository optionRepository, QuizAttemptRepository attemptRepository, 
                      UserRepository userRepository) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.attemptRepository = attemptRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void createQuiz(String sectionId, QuizRequest request) {
        // Check if quiz already exists for this section
        Optional<SectionQuiz> existingQuiz = quizRepository.findBySectionId(sectionId);
        if (existingQuiz.isPresent()) {
            throw new RuntimeException("A quiz already exists for this section. Please delete the existing quiz first.");
        }
        
        SectionQuiz quiz = new SectionQuiz();
        quiz.setId(UUID.randomUUID().toString());
        quiz.setSectionId(sectionId);
        quiz.setTitle(request.getTitle());
        quizRepository.save(quiz);

        for (QuizRequest.QuestionRequest qReq : request.getQuestions()) {
            QuizQuestion question = new QuizQuestion();
            question.setId(UUID.randomUUID().toString());
            question.setQuizId(quiz.getId());
            question.setQuestion(qReq.getQuestion());
            question.setCorrectAnswer(qReq.getCorrectAnswer());
            questionRepository.save(question);

            for (String optText : qReq.getOptions()) {
                QuizOption option = new QuizOption();
                option.setId(UUID.randomUUID().toString());
                option.setQuestionId(question.getId());
                option.setOptionText(optText);
                optionRepository.save(option);
            }
        }
    }

    public Map<String, Object> getQuiz(String sectionId) {
        SectionQuiz quiz = quizRepository.findBySectionId(sectionId).orElse(null);
        if (quiz == null) return null;

        List<QuizQuestion> questions = questionRepository.findByQuizId(quiz.getId());
        
        Map<String, Object> result = new HashMap<>();
        result.put("id", quiz.getId());
        result.put("title", quiz.getTitle());
        
        List<Map<String, Object>> questionList = new ArrayList<>();
        for (QuizQuestion q : questions) {
            List<QuizOption> options = optionRepository.findByQuestionId(q.getId());
            Map<String, Object> qMap = new HashMap<>();
            qMap.put("id", q.getId());
            qMap.put("question", q.getQuestion());
            qMap.put("options", options.stream().map(o -> Map.of("id", o.getId(), "text", o.getOptionText())).toList());
            qMap.put("correctAnswer", q.getCorrectAnswer());
            questionList.add(qMap);
        }
        result.put("questions", questionList);
        return result;
    }

    @Transactional
    public Map<String, Object> submitQuiz(String quizId, Map<String, String> answers) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        SectionQuiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new RuntimeException("Quiz not found"));
        
        int correctAnswers = 0;
        for (QuizQuestion question : quiz.getQuestions()) {
            String userAnswerId = answers.get(question.getId());
            if (userAnswerId != null) {
                QuizOption selectedOption = optionRepository.findById(userAnswerId).orElse(null);
                if (selectedOption != null && question.getCorrectAnswer().equals(selectedOption.getOptionText())) {
                    correctAnswers++;
                }
            }
        }

        int totalQuestions = quiz.getQuestions().size();
        double percentage = (double) correctAnswers / totalQuestions * 100;
        boolean passed = percentage >= 60;

        QuizAttempt attempt = new QuizAttempt();
        attempt.setId(UUID.randomUUID().toString());
        attempt.setQuizId(quizId);
        attempt.setUserId(user.getId());
        attempt.setScore(correctAnswers);
        attempt.setTotalQuestions(totalQuestions);
        attempt.setPassed(passed);
        attemptRepository.save(attempt);

        List<QuizAttempt> allAttempts = attemptRepository.findByUserIdAndQuizIdIn(user.getId(), List.of(quizId));

        Map<String, Object> result = new HashMap<>();
        result.put("score", Math.round(percentage));
        result.put("correctAnswers", correctAnswers);
        result.put("totalQuestions", totalQuestions);
        result.put("percentage", Math.round(percentage));
        result.put("passed", passed);
        result.put("attemptCount", allAttempts.size());
        return result;
    }

    public Map<String, Object> getQuizStatus(String quizId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        List<QuizAttempt> attempts = attemptRepository.findByUserIdAndQuizIdIn(user.getId(), List.of(quizId));
        QuizAttempt latestAttempt = attempts.isEmpty() ? null : attempts.get(attempts.size() - 1);
        
        Map<String, Object> result = new HashMap<>();
        if (latestAttempt != null) {
            double percentage = (double) latestAttempt.getScore() / latestAttempt.getTotalQuestions() * 100;
            result.put("score", Math.round(percentage));
            result.put("passed", latestAttempt.getPassed());
            result.put("attemptCount", attempts.size());
        }
        return result;
    }

    @Transactional
    public void deleteQuiz(String sectionId) {
        SectionQuiz quiz = quizRepository.findBySectionId(sectionId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        
        // Delete all questions and options (cascade should handle this)
        quizRepository.delete(quiz);
    }
}
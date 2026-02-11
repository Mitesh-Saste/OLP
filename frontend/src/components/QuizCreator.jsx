import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Divider
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { quizApi } from '../services/api';





const QuizCreator = ({ open, onClose, onQuizCreated, sectionId, sectionTitle, existingQuiz }) => {
  const [title, setTitle] = useState(`${sectionTitle} Quiz`);
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctAnswer: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (existingQuiz) {
      setIsEditMode(true);
      setTitle(existingQuiz.title);
      setQuestions(existingQuiz.questions.map((q) => ({
        question: q.question,
        options: q.options.map((o) => o.text || o) || ['', '', '', ''],
        correctAnswer: q.correctAnswer
      })));
    } else {
      setIsEditMode(false);
      setTitle(`${sectionTitle} Quiz`);
      setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: '' }]);
    }
  }, [existingQuiz, sectionTitle]);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: '' }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    const payload = {
      title,
      questions: questions.map(q => ({
        question: q.question,
        options: q.options.filter(opt => opt.trim() !== ''),
        correctAnswer: q.correctAnswer
      }))
    };
    
    // If section is unsaved (temp ID), just return the data
    if (sectionId.startsWith('temp-')) {
      if (onQuizCreated) {
        onQuizCreated(payload);
      }
      return;
    }
    
    // For edit mode, delete old quiz and create new one
    try {
      setLoading(true);
      if (isEditMode) {
        await quizApi.deleteQuiz(sectionId);
      }
      console.log('Creating quiz with payload:', payload);
      await quizApi.createQuiz(sectionId, payload);
      alert(`Quiz ${isEditMode ? 'updated' : 'created'} successfully!`);
      if (onQuizCreated) {
        onQuizCreated();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save quiz:', error);
      console.error('Error response:', error.response.data);
      alert(`Failed to save quiz: ${error.response.data.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Quiz' : 'Create Quiz'} for {sectionTitle}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Questions</Typography>
            <Button startIcon={<AddIcon />} onClick={addQuestion}>
              Add Question
            </Button>
          </Box>

          {questions.map((question, qIndex) => (
            <Box key={qIndex} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Question {qIndex + 1}</Typography>
                {questions.length > 1 && (
                  <IconButton size="small" onClick={() => removeQuestion(qIndex)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <TextField
                label="Question"
                value={question.question}
                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                fullWidth
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle2" sx={{ mb: 1 }}>Options:</Typography>
              {question.options.map((option, oIndex) => (
                <TextField
                  key={oIndex}
                  label={`Option ${oIndex + 1}`}
                  value={option}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ mb: 1 }}
                />
              ))}

              <TextField
                label="Correct Answer"
                value={question.correctAnswer}
                onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                fullWidth
                size="small"
                helperText="Enter the exact text of the correct option"
              />
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Quiz' : 'Create Quiz')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuizCreator;

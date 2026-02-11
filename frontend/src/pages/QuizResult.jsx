import React from 'react';
import { Container, Card, CardContent, Typography, Box, Button, Chip } from '@mui/material';
import { CheckCircle, Cancel, EmojiEvents } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const QuizResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { score, correctAnswers, totalQuestions, passed, attemptCount, courseId } = location.state || {};

  if (!location.state) {
    navigate(-1);
    return null;
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card sx={{ textAlign: 'center', p: 4 }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            {passed ? (
              <CheckCircle sx={{ fontSize: 100, color: 'success.main' }} />
            ) : (
              <Cancel sx={{ fontSize: 100, color: 'error.main' }} />
            )}
          </Box>

          <Typography variant="h3" gutterBottom>
            {passed ? 'Congratulations!' : 'Keep Trying!'}
          </Typography>

          <Chip 
            label={passed ? 'PASSED' : 'FAILED'}
            color={passed ? 'success' : 'error'}
            sx={{ fontSize: 18, py: 3, px: 2, mb: 3 }}
          />

          <Box sx={{ my: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom>
              {score}%
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {correctAnswers} out of {totalQuestions} correct
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
            <EmojiEvents sx={{ color: 'warning.main' }} />
            <Typography variant="body1">
              Total Attempts: {attemptCount}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {passed 
              ? 'You have successfully passed this quiz!' 
              : 'You need 60% or higher to pass. Review the material and try again.'}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              onClick={() => navigate(`/learn/${courseId}`)}
            >
              Back to Course
            </Button>
            {!passed && (
              <Button 
                variant="outlined" 
                onClick={() => navigate(-1)}
              >
                Retake Quiz
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default QuizResult;


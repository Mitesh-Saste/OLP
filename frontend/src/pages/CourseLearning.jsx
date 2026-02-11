import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import { ExpandMore, PlayArrow, CheckCircle } from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { courseApi, progressApi, quizApi } from '../services/api';
const CourseLearning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizAttempts, setQuizAttempts] = useState({});
  const [progress, setProgress] = useState(null);
  const [sectionQuizzes, setSectionQuizzes] = useState({});
  const [completedLessons, setCompletedLessons] = useState(new Set());

  useEffect(() => {
    if (id) {
      loadCourse(id);
      loadProgress(id);
    }
  }, [id]);

  useEffect(() => {
    if (course) {
      loadSectionQuizzes();
      selectFirstIncompleteLesson();
    }
  }, [course]);

  useEffect(() => {
    if (course) {
      loadSectionQuizzes();
    }
  }, [location.pathname]);

  const loadCourse = async (courseId) => {
    try {
      const response = await courseApi.getCourse(courseId);
      setCourse(response.data);
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async (courseId) => {
    try {
      const response = await progressApi.getCourseProgress(courseId);
      setProgress(response.data);
      if (response.data.completedLessonIds) {
        setCompletedLessons(new Set(response.data.completedLessonIds));
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const loadSectionQuizzes = async () => {
    if (!course.sections) return;
    
    const quizzes = {};
    const attempts = {};
    
    for (const section of course.sections) {
      try {
        const response = await quizApi.getQuiz(section.id);
        if (response.data) {
          quizzes[section.id] = response.data;
          
          try {
            const statusResponse = await quizApi.getQuizStatus(response.data.id);
            console.log('Quiz status for', response.data.id, ':', statusResponse.data);
            attempts[response.data.id] = statusResponse.data;
          } catch (error) {
            console.log('No attempt yet for quiz:', response.data.id);
          }
        }
      } catch (error) {
        console.log('No quiz for section:', section.id);
      }
    }
    console.log('All quiz attempts:', attempts);
    setSectionQuizzes(quizzes);
    setQuizAttempts(attempts);
  };

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
    setSelectedQuiz(null);
  };

  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz);
    setSelectedLesson(null);
  };

  const handleQuizAnswerChange = (questionId, optionId) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const submitQuiz = async () => {
    if (!selectedQuiz) return;
    
    try {
      const response = await quizApi.submitQuiz(selectedQuiz.id, quizAnswers);
      const { score, correctAnswers, totalQuestions, passed, attemptCount } = response.data;
      
      navigate('/quiz-result', {
        state: { score, correctAnswers, totalQuestions, passed, attemptCount, courseId: id }
      });
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Failed to submit quiz');
    }
  };

  const getQuizStatus = (quiz) => {
    const attempt = quizAttempts[quiz.id];
    console.log('Getting status for quiz', quiz.id, 'attempt:', attempt);
    if (!attempt || attempt.score === undefined) return { status: 'Not Attempted', color: 'default' };
    if (attempt.passed) return { status: 'Passed', color: 'success' };
    return { status: 'Failed', color: 'error' };
  };

  const markLessonComplete = async (lessonId) => {
    try {
      await progressApi.markLessonComplete(lessonId);
      setCompletedLessons(prev => new Set(prev).add(lessonId));
      if (id) {
        loadProgress(id);
      }
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
    }
  };

  const isLessonCompleted = (lessonId) => completedLessons.has(lessonId);

  const isSectionCompleted = (section) => {
    if (!section.lessons || section.lessons.length === 0) return false;
    return section.lessons.every((lesson) => isLessonCompleted(lesson.id));
  };

  const selectFirstIncompleteLesson = () => {
    if (!course.sections || selectedLesson || selectedQuiz) return;
    
    // Find first incomplete lesson
    for (const section of course.sections) {
      if (section.lessons) {
        for (const lesson of section.lessons) {
          if (!isLessonCompleted(lesson.id)) {
            setSelectedLesson(lesson);
            return;
          }
        }
      }
    }
    
    // If all lessons completed or no progress yet, select first lesson
    if (course.sections[0].lessons[0]) {
      setSelectedLesson(course.sections[0].lessons[0]);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Course not found or you are not enrolled</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Course Content Sidebar */}
        <Box sx={{ width: '40%' }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>{course.title}</Typography>
              
              {progress && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Progress: {progress.completedLessons} of {progress.totalLessons} items completed
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress.progressPercent} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(progress.progressPercent)}% Complete
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                {course.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" sx={{ mr: 1, mb: 1 }} />
                ))}
              </Box>

              {/* Sections and Lessons */}
              {course.sections.map((section, sectionIndex) => (
                <Accordion key={section.id} defaultExpanded={sectionIndex === 0}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>{section.title}</Typography>
                      {isSectionCompleted(section) && <CheckCircle sx={{ color: 'success.main' }} />}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    {section.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ p: 2, pt: 0 }}>
                        {section.description}
                      </Typography>
                    )}
                    <List dense>
                      {section.lessons.map((lesson) => (
                        <ListItem key={lesson.id} disablePadding>
                          <ListItemButton
                            onClick={() => handleLessonClick(lesson)}
                            selected={selectedLesson.id === lesson.id}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              {lesson.videoUrl ? <PlayArrow sx={{ mr: 1 }} /> : <CheckCircle sx={{ mr: 1 }} />}
                              <ListItemText 
                                primary={lesson.title}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </Box>
                          </ListItemButton>
                        </ListItem>
                      ))}
                      
                      {sectionQuizzes[section.id] && (
                        <ListItem disablePadding>
                          <ListItemButton
                            onClick={() => handleQuizClick(sectionQuizzes[section.id])}
                            selected={selectedQuiz.id === sectionQuizzes[section.id].id}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircle sx={{ mr: 1, color: 'primary.main' }} />
                                <ListItemText 
                                  primary={`Quiz: ${sectionQuizzes[section.id].title}`}
                                  primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                                />
                              </Box>
                              <Chip 
                                label={getQuizStatus(sectionQuizzes[section.id]).status}
                                color={getQuizStatus(sectionQuizzes[section.id]).color }
                                size="small"
                              />
                            </Box>
                          </ListItemButton>
                        </ListItem>
                      )}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Box>

        {/* Lesson Content Area */}
        <Box sx={{ width: '60%' }}>
          {selectedLesson ? (
            <Card>
              <CardContent>
                <Typography variant="h4" gutterBottom>{selectedLesson.title}</Typography>
                
                {selectedLesson.videoUrl && (
                  <Box sx={{ mb: 3 }}>
                    {selectedLesson.videoUrl.includes('youtube.com') || selectedLesson.videoUrl.includes('youtu.be') ? (
                      <iframe
                        width="100%"
                        height="400"
                        src={selectedLesson.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Video Player"
                      />
                    ) : (
                      <video
                        controls
                        width="100%"
                        height="400"
                        preload="metadata"
                        src={selectedLesson.videoUrl}
                        onError={(e) => console.error('Video error:', e)}
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </Box>
                )}

                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedLesson.content}
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  <Button 
                    variant="contained" 
                    onClick={(e) => {
                      e.preventDefault();
                      markLessonComplete(selectedLesson.id);
                    }}
                    disabled={isLessonCompleted(selectedLesson.id)}
                    startIcon={<CheckCircle />}
                    sx={{ 
                      background: isLessonCompleted(selectedLesson.id) ? 'grey.400' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:disabled': { color: 'white' }
                    }}
                  >
                    {isLessonCompleted(selectedLesson.id) ? 'Completed' : 'Mark '}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : selectedQuiz ? (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h4">{selectedQuiz.title}</Typography>
                  <Chip 
                    label={getQuizStatus(selectedQuiz).status}
                    color={getQuizStatus(selectedQuiz).color }
                  />
                </Box>
                
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Complete this quiz to finish the section. You need 60% or higher to pass.
                </Typography>
                
                {selectedQuiz.questions.map((question, index) => (
                  <Box key={question.id} sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {index + 1}. {question.question}
                    </Typography>
                    {question.options.map((option) => (
                      <Box key={option.id} sx={{ ml: 2, mb: 1 }}>
                        <label>
                          <input
                            type="radio"
                            name={question.id}
                            value={option.id}
                            checked={quizAnswers[question.id] === option.id}
                            onChange={() => handleQuizAnswerChange(question.id, option.id)}
                            style={{ marginRight: '8px' }}
                          />
                          {option.text}
                        </label>
                      </Box>
                    ))}
                  </Box>
                ))}
                
                {quizAttempts[selectedQuiz.id] && quizAttempts[selectedQuiz.id].score !== undefined && (
                  <Alert severity={quizAttempts[selectedQuiz.id].passed ? 'success' : 'warning'} sx={{ mb: 2 }}>
                    Last attempt: {quizAttempts[selectedQuiz.id].score}% - {quizAttempts[selectedQuiz.id].passed ? 'PASSED' : 'FAILED'}
                    <br />
                    Total attempts: {quizAttempts[selectedQuiz.id].attemptCount || 1}
                    {!quizAttempts[selectedQuiz.id].passed && ' (You can retake the quiz)'}
                  </Alert>
                )}
                
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={(e) => {
                    e.preventDefault();
                    submitQuiz();
                  }}
                  disabled={Object.keys(quizAnswers).length !== selectedQuiz.questions.length}
                >
                  {quizAttempts[selectedQuiz.id] ? 'Retake Quiz' : 'Submit Quiz'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>Welcome to {course.title}</Typography>
                <Typography variant="body1" color="text.secondary">
                  Select a lesson from the sidebar to start learning.
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {course.description}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default CourseLearning;

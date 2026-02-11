import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, Button, Chip, Box, Alert, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { courseApi } from '../services/api';
import { Course } from '../types';
import { CheckCircle, Schedule, Person } from '@mui/icons-material';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      loadCourse(id);
      checkEnrollment(id);
    }
  }, [id]);

  const checkEnrollment = async (courseId: string) => {
    try {
      const response = await courseApi.getEnrolledCourses();
      const isEnrolled = response.data.content.some((c: Course) => c.id === courseId);
      setEnrolled(isEnrolled);
    } catch (error) {
      console.error('Failed to check enrollment');
    }
  };

  const loadCourse = async (courseId: string) => {
    try {
      const response = await courseApi.getCourse(courseId);
      setCourse(response.data);
    } catch (error) {
      setMessage('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);
    try {
      await courseApi.enrollInCourse(course.id);
      setEnrolled(true);
      setMessage('Successfully enrolled in the course!');
      window.location.reload();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Course not found</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>{course.title}</Typography>
          {course.instructorName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person />
              <Typography variant="h6" sx={{ opacity: 0.9 }}>by {course.instructorName}</Typography>
            </Box>
          )}
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ mt: -4 }}>
        <Card sx={{ p: 4, borderRadius: 4 }}>
          {message && (
            <Alert severity={enrolled ? 'success' : 'error'} sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>
          )}
          {course.isPublished && !enrolled && localStorage.getItem('role') === 'STUDENT' && (
            <Button variant="contained" size="large" onClick={handleEnroll} disabled={enrolling} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', px: 4, py: 1.5, mb: 4 }}>
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </Button>
          )}
          {enrolled && localStorage.getItem('role') === 'STUDENT' && (
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <Button variant="contained" size="large" onClick={() => navigate(`/learn/${course.id}`)} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>Start Learning</Button>
              <Button variant="contained" size="large" disabled sx={{ bgcolor: 'success.main', '&.Mui-disabled': { bgcolor: 'success.main', color: 'white' } }}>Enrolled</Button>
            </Box>
          )}
          {!course.isPublished && (
            <Alert severity="info" sx={{ borderRadius: 2, mb: 4 }}>This course is not yet published and is not available for enrollment.</Alert>
          )}
          
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            {course.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" sx={{ bgcolor: 'primary.50', color: 'primary.main', fontWeight: 500 }} />
            ))}
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>About this course</Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>{course.description}</Typography>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule sx={{ color: 'primary.main' }} />
              <Typography>Updated {new Date(course.updatedAt).toLocaleDateString()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ color: course.isPublished ? 'success.main' : 'text.secondary' }} />
              <Typography>{course.isPublished ? 'Published' : 'Draft'}</Typography>
            </Box>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default CourseDetail;
import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, TextField, Chip, Box, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { courseApi } from '../services/api';
import { Search, LocalOffer, School, Person } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { CourseGridSkeleton } from '../components/LoadingSkeleton';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [tagFilter, setTagFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
    if (localStorage.getItem('role') === 'STUDENT') {
      loadEnrolledCourses();
    }
  }, [tagFilter]);

  const loadEnrolledCourses = async () => {
    try {
      const response = await courseApi.getEnrolledCourses();
      const enrolled = new Set(response.data.content.map((c) => c.id));
      setEnrolledCourses(enrolled);
    } catch (error) {
      console.error('Failed to load enrolled courses');
    }
  };

  const loadCourses = async () => {
    try {
      const response = await courseApi.getCourses({ tag: tagFilter || undefined });
      setCourses(response.data.content);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await courseApi.enrollInCourse(courseId);
      toast.success('Enrolled successfully!');
      setEnrolledCourses(prev => new Set(prev).add(courseId));
    } catch (error) {
      toast.error(error.response.data.message || 'Enrollment failed');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', py: 8, mb: 4, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <School sx={{ fontSize: 48 }} />
              <Typography variant="h3" sx={{ fontWeight: 700 }}>Explore Courses</Typography>
            </Box>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>Discover your next learning adventure</Typography>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Box sx={{ display: 'flex', gap: 2, maxWidth: 600 }}>
              <TextField fullWidth placeholder="Search by tag..." value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: 'white' }} /></InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white', '& fieldset': { border: 'none' }, '&:hover': { background: 'rgba(255, 255, 255, 0.2)' }, '& input::placeholder': { color: 'rgba(255, 255, 255, 0.7)', opacity: 1 } } }} />
              <Button variant="contained" onClick={() => setTagFilter('')} sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }, minWidth: 100 }}>Clear</Button>
            </Box>
          </motion.div>
        </Container>
      </Box>
      <Container maxWidth="lg">
        {loading ? (
          <CourseGridSkeleton />
        ) : (
          <Grid container spacing={3}>
            {courses.map((course, index) => (
              <Grid item xs={12} md={6} lg={4} key={course.id}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }} whileHover={{ y: -8 }}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'visible', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 12px 40px rgba(99, 102, 241, 0.2)' } }}>
                <Box sx={{ position: 'absolute', top: -10, right: 16, bgcolor: 'secondary.main', color: 'white', px: 2, py: 0.5, borderRadius: 2, fontSize: '0.75rem', fontWeight: 600 }}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </Box>
                <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>{course.title}</Typography>
                  {course.instructorName && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Person sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">{course.instructorName}</Typography>
                    </Box>
                  )}
                  <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {course.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" icon={<LocalOffer sx={{ fontSize: 14 }} />} sx={{ bgcolor: 'primary.50', color: 'primary.main', fontWeight: 500 }} />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                    <Button fullWidth variant="outlined" onClick={() => navigate(`/courses/${course.id}`)}>View Details</Button>
                    {localStorage.getItem('role') === 'STUDENT' && course.isPublished && (
                      enrolledCourses.has(course.id) ? (
                        <Button fullWidth variant="contained" disabled sx={{ bgcolor: 'success.main', '&.Mui-disabled': { bgcolor: 'success.main', color: 'white' } }}>Enrolled</Button>
                      ) : (
                        <Button fullWidth variant="contained" onClick={() => handleEnroll(course.id)}>Enroll</Button>
                      )
                    )}
                  </Box>
                </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default CourseCatalog;

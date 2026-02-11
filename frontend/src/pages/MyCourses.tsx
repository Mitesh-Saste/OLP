import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, CardActions, Grid, Button, Chip, Box, Tabs, Tab, LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { courseApi, certificateApi } from '../services/api';
import { Course } from '../types';
import CourseProgress from '../components/CourseProgress';
import { PlayCircleOutline, MenuBook, EmojiEvents, CheckCircle } from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [certificates, setCertificates] = useState<Record<string, any>>({});
  const navigate = useNavigate();

  useEffect(() => {
    loadEnrolledCourses();
  }, []);

  const loadEnrolledCourses = async () => {
    try {
      const response = await courseApi.getEnrolledCourses();
      setCourses(response.data.content);
      checkCertificates(response.data.content);
    } catch (error) {
      console.error('Failed to load enrolled courses:', error);
    }
  };

  const checkCertificates = async (courseList: Course[]) => {
    const certs: Record<string, any> = {};
    for (const course of courseList) {
      try {
        console.log('Checking certificate for course:', course.id);
        const response = await certificateApi.checkAndGenerate(course.id);
        console.log('Certificate response:', response.data);
        if (response.data.eligible) {
          certs[course.id] = response.data;
        }
      } catch (error: any) {
        console.log('Certificate error for course', course.id, ':', error.response?.data || error.message);
      }
    }
    console.log('All certificates:', certs);
    setCertificates(certs);
  };

  const completedCourses = courses.filter(course => certificates[course.id]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>My Learning</Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>Continue your journey</Typography>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ mt: -3 }}>
        <Box sx={{ bgcolor: 'white', borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
            <Tab label="All Courses" icon={<MenuBook />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab label="Certifications" icon={<EmojiEvents />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 600 }} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {courses.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <MenuBook sx={{ fontSize: 80, color: 'primary.main', mb: 2, opacity: 0.5 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>No courses yet</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>Start learning by enrolling in courses from our catalog</Typography>
                <Button variant="contained" size="large" onClick={() => navigate('/')}>Browse Courses</Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {courses.map((course) => (
                  <Grid item xs={12} md={6} key={course.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>{course.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{course.description}</Typography>
                        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {course.tags.map((tag) => (
                            <Chip key={tag} label={tag} size="small" sx={{ bgcolor: 'primary.50' }} />
                          ))}
                        </Box>
                        <CourseProgress courseId={course.id} />
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button fullWidth variant="contained" startIcon={<PlayCircleOutline />} onClick={() => navigate(`/learn/${course.id}`)}>Continue Learning</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {completedCourses.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <EmojiEvents sx={{ fontSize: 80, color: 'secondary.main', mb: 2, opacity: 0.5 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>No certifications yet</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>Complete courses to earn certifications</Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {completedCourses.map((course) => (
                  <Grid item xs={12} md={6} key={course.id}>
                    <Card sx={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', border: '2px solid', borderColor: 'primary.main' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <EmojiEvents sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{course.title}</Typography>
                            <Typography variant="caption" color="text.secondary">Completed</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                          <Typography variant="body2" color="success.main" fontWeight={600}>Certificate Earned</Typography>
                        </Box>
                        <Button variant="outlined" fullWidth onClick={() => navigate(`/certificate/${course.id}`)}>View Certificate</Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
        </Box>
      </Container>
    </Box>
  );
};

export default MyCourses;
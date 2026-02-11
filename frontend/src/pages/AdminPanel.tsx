import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Button,
  Chip,
  Box,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import { courseApi } from '../services/api';
import { Course } from '../types';
import CourseEditor from '../components/CourseEditor';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminPanel: React.FC = () => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [openEditor, setOpenEditor] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    loadAllCourses();
  }, []);

  const loadAllCourses = async () => {
    try {
      const response = await courseApi.getCourses();
      setAllCourses(response.data.content);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const handlePublishCourse = async (courseId: string, courseTitle: string) => {
    try {
      await courseApi.publishCourse(courseId);
      alert(`Course "${courseTitle}" published successfully!`);
      loadAllCourses();
    } catch (error: any) {
      console.error('Failed to publish course:', error);
      alert(`Failed to publish course: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${courseTitle}"? This will remove all sections, lessons, and student enrollments.`)) {
      try {
        await courseApi.deleteCourse(courseId);
        alert(`Course "${courseTitle}" deleted successfully!`);
        loadAllCourses();
      } catch (error: any) {
        console.error('Failed to delete course:', error);
        alert(`Failed to delete course: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setOpenEditor(true);
  };

  const handleEditorSave = () => {
    setOpenEditor(false);
    setEditingCourse(null);
    loadAllCourses(); // Reload courses after editing
  };

  const unpublishedCourses = allCourses.filter(course => !course.isPublished);
  const publishedCourses = allCourses.filter(course => course.isPublished);

  const renderCourseCard = (course: Course, showPublish: boolean, showDelete: boolean) => (
    <Grid item xs={12} md={6} key={course.id}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>{course.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {course.description}
          </Typography>
          <Box sx={{ mb: 2 }}>
            {course.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" sx={{ mr: 1, mb: 1 }} />
            ))}
          </Box>
          <Typography variant="caption" display="block">
            Status: {course.isPublished ? 'Published' : 'Draft'}
          </Typography>
          <Typography variant="caption" display="block">
            Created: {new Date(course.createdAt).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" display="block">
            Instructor ID: {course.instructorId}
          </Typography>
        </CardContent>
        <CardActions>
          <Button 
            size="small" 
            onClick={() => handleEditCourse(course)}
          >
            Edit
          </Button>
          {showPublish && (
            <Button 
              size="small" 
              variant="contained" 
              color="primary"
              onClick={() => handlePublishCourse(course.id, course.title)}
            >
              Publish
            </Button>
          )}
          {showDelete && (
            <Button 
              size="small" 
              color="error"
              onClick={() => handleDeleteCourse(course.id, course.title)}
            >
              Delete
            </Button>
          )}
        </CardActions>
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>Admin Panel</Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>Manage courses and approvals</Typography>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ mt: -3, pb: 6 }}>
        <Box sx={{ bgcolor: 'white', borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
            <Tab label={`Unpublished Courses (${unpublishedCourses.length})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab label={`Published Courses (${publishedCourses.length})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
          </Tabs>

      <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Newly Created Courses Awaiting Approval
          </Typography>
          {unpublishedCourses.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>No unpublished courses found.</Alert>
          ) : (
            <Grid container spacing={3}>
              {unpublishedCourses.map((course) => 
                renderCourseCard(course, true, false)
              )}
            </Grid>
          )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Published Courses
          </Typography>
          {publishedCourses.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>No published courses found.</Alert>
          ) : (
            <Grid container spacing={3}>
              {publishedCourses.map((course) => 
                renderCourseCard(course, false, true)
              )}
            </Grid>
          )}
      </TabPanel>

      </Box>
      </Container>

      <CourseEditor
        open={openEditor}
        onClose={() => setOpenEditor(false)}
        course={editingCourse}
        onSave={handleEditorSave}
      />
    </Box>
  );
};

export default AdminPanel;
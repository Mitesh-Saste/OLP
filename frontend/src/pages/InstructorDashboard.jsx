import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import { courseApi } from '../services/api';
import CreateCourseDialog from '../components/CreateCourseDialog';
import CourseEditor from '../components/CourseEditor';



function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditor, setOpenEditor] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await courseApi.getInstructorCourses();
      setCourses(response.data.content);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const loadStudents = async (courseId) => {
    try {
      const response = await courseApi.getCourseStudents(courseId);
      setStudents(response.data.content);
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  const handleCreateCourse = async (courseData) => {
    try {
      const tags = courseData.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag);
      const response = await courseApi.createCourse({
        title: courseData.title,
        description: courseData.description,
        tags,
        sections: courseData.sections
      });
      
      const courseId = response.data.id;
      
      // Create quizzes for sections that have them
      for (const section of courseData.sections) {
        if (section.quiz) {
          const createdCourse = await courseApi.getCourse(courseId);
          const createdSection = createdCourse.data.sections.find((s) => 
            s.title === section.title && s.sortOrder === section.sortOrder
          );
          if (createdSection) {
            await fetch(`http://localhost:8080/api/v1/quizzes/${createdSection.id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
              },
              body: JSON.stringify(section.quiz)
            });
          }
        }
      }
      
      setOpenDialog(false);
      loadCourses();
    } catch (error) {
      console.error('Failed to create course:', error);
    }
  };

  const handleViewStudents = (course) => {
    setSelectedCourse(course);
    loadStudents(course.id);
    setTabValue(1);
  };

  const handlePublishCourse = async (courseId) => {
    try {
      await courseApi.publishCourse(courseId);
      loadCourses(); // Reload to show updated status
    } catch (error) {
      console.error('Failed to publish course:', error);
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (window.confirm(`Are you sure you want to delete "${courseTitle}"? This will remove all sections, lessons, and student enrollments.`)) {
      try {
        await courseApi.deleteCourse(courseId);
        alert('Course deleted successfully!');
        loadCourses(); // Reload to show updated list
      } catch (error) {
        console.error('Failed to delete course:', error);
        alert(`Failed to delete course: ${error.response.data.message || error.message}`);
      }
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setOpenEditor(true);
  };

  const handleEditorSave = () => {
    setOpenEditor(false);
    setEditingCourse(null);
    loadCourses(); // Reload courses after editing
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>Instructor Dashboard</Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>Manage your courses and students</Typography>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ mt: -3, pb: 6 }}>
        <Box sx={{ bgcolor: 'white', borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
            <Tab label="My Courses" sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab label="Course Students" sx={{ textTransform: 'none', fontWeight: 600 }} />
          </Tabs>

      <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <Button variant="contained" onClick={() => setOpenDialog(true)} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              Create New Course
            </Button>
          </Box>

        <Grid container spacing={3}>
          {courses.map((course) => (
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
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleViewStudents(course)}>
                    View Students
                  </Button>
                  <Button size="small" onClick={() => handleEditCourse(course)}>
                    Edit
                  </Button>
                  {!course.isPublished && (
                    <Button 
                      size="small" 
                      variant="contained" 
                      onClick={() => handlePublishCourse(course.id)}
                    >
                      Publish
                    </Button>
                  )}
                  <Button 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteCourse(course.id, course.title)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
          {selectedCourse && (
            <>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Students enrolled in: {selectedCourse.title}
              </Typography>
              <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.username}</TableCell>
                      <TableCell>{student.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </TabPanel>

      </Box>
      </Container>

      <CreateCourseDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleCreateCourse}
      />

      <CourseEditor
        open={openEditor}
        onClose={() => setOpenEditor(false)}
        course={editingCourse}
        onSave={handleEditorSave}
      />
    </Box>
  );
};

export default InstructorDashboard;

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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Course } from '../types';
import { courseApi, quizApi } from '../services/api';
import QuizCreator from './QuizCreator';

interface CourseEditorProps {
  open: boolean;
  onClose: () => void;
  course: Course | null;
  onSave: () => void;
}

interface Section {
  id?: string;
  title: string;
  description: string;
  sortOrder: number;
  lessons: Lesson[];
  pendingQuiz?: any;
}

interface Lesson {
  id?: string;
  title: string;
  content: string;
  videoUrl: string;
  sortOrder: number;
}

const CourseEditor: React.FC<CourseEditorProps> = ({ open, onClose, course, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [selectedSectionForQuiz, setSelectedSectionForQuiz] = useState<Section | null>(null);
  const [existingQuizzes, setExistingQuizzes] = useState<Record<string, any>>({});

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
      setTags(course.tags.join(', '));
      setSections(course.sections?.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description || '',
        sortOrder: s.sortOrder,
        lessons: s.lessons?.map(l => ({
          id: l.id,
          title: l.title,
          content: l.content,
          videoUrl: l.videoUrl || '',
          sortOrder: l.sortOrder
        })) || []
      })) || []);
      loadExistingQuizzes();
    }
  }, [course]);

  const loadExistingQuizzes = async () => {
    if (!course?.sections) return;
    const quizzes: Record<string, any> = {};
    for (const section of course.sections) {
      try {
        const response = await quizApi.getQuiz(section.id!);
        if (response.data) {
          quizzes[section.id!] = response.data;
        }
      } catch (error) {
        // No quiz for this section
      }
    }
    setExistingQuizzes(quizzes);
  };

  const handleSave = async () => {
    if (!course) return;
    
    try {
      setLoading(true);
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      // Update basic course info
      await courseApi.updateCourse(course.id, {
        title,
        description,
        tags: tagsArray
      });
      
      // Handle sections and lessons
      const existingSections = course.sections || [];
      const currentSections = sections;
      
      // Delete removed lessons first
      for (const existingSection of existingSections) {
        const currentSection = currentSections.find(s => s.id === existingSection.id);
        if (currentSection && existingSection.lessons) {
          for (const existingLesson of existingSection.lessons) {
            const stillExists = currentSection.lessons.find(l => l.id === existingLesson.id);
            if (!stillExists) {
              await courseApi.deleteLesson(course.id, existingLesson.id!);
            }
          }
        }
      }
      
      // Process each current section
      for (const section of currentSections) {
        let sectionId = section.id;
        
        if (section.id && section.id.startsWith('temp-')) {
          // New section - create it first
          const response = await courseApi.addSection(course.id, {
            title: section.title,
            description: section.description,
            sortOrder: section.sortOrder
          });
          
          // Reload course to get the new section ID
          const updatedCourse = await courseApi.getCourse(course.id);
          const newSection = updatedCourse.data.sections?.find((s: any) => 
            s.title === section.title && s.sortOrder === section.sortOrder
          );
          sectionId = newSection?.id;
          
          // Create pending quiz if exists
          if (section.pendingQuiz && sectionId) {
            await quizApi.createQuiz(sectionId, section.pendingQuiz);
          }
        } else if (section.id) {
          // Existing section - update it
          await courseApi.updateSection(course.id, section.id, {
            title: section.title,
            description: section.description,
            sortOrder: section.sortOrder
          });
        }
        
        // Handle lessons for this section
        if (sectionId && section.lessons) {
          for (const lesson of section.lessons) {
            if (lesson.id && lesson.id.startsWith('temp-')) {
              // New lesson - create it
              await courseApi.addLesson(course.id, {
                title: lesson.title,
                content: lesson.content,
                videoUrl: lesson.videoUrl,
                sortOrder: lesson.sortOrder,
                sectionId: sectionId!
              });
            } else if (lesson.id) {
              // Existing lesson - update it
              await courseApi.updateLesson(course.id, lesson.id, {
                title: lesson.title,
                content: lesson.content,
                videoUrl: lesson.videoUrl,
                sortOrder: lesson.sortOrder,
                sectionId: sectionId!
              });
            }
          }
        }
      }
      
      // Delete removed sections
      for (const existingSection of existingSections) {
        const stillExists = currentSections.find(s => s.id === existingSection.id);
        if (!stillExists) {
          await courseApi.deleteSection(course.id, existingSection.id!);
        }
      }
      
      alert('Course updated successfully!');
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Failed to update course:', error);
      console.error('Error response:', error.response?.data);
      alert(`Failed to save changes: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    setSections([...sections, {
      id: `temp-${Date.now()}`,
      title: '',
      description: '',
      sortOrder: sections.length + 1,
      lessons: []
    }]);
  };

  const updateSection = (index: number, field: keyof Section, value: any) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  const deleteSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const addLesson = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].lessons.push({
      id: `temp-${Date.now()}-${Math.random()}`,
      title: '',
      content: '',
      videoUrl: '',
      sortOrder: newSections[sectionIndex].lessons.length + 1
    });
    setSections(newSections);
  };

  const updateLesson = (sectionIndex: number, lessonIndex: number, field: keyof Lesson, value: any) => {
    const newSections = [...sections];
    newSections[sectionIndex].lessons[lessonIndex] = {
      ...newSections[sectionIndex].lessons[lessonIndex],
      [field]: value
    };
    setSections(newSections);
  };

  const deleteLesson = (sectionIndex: number, lessonIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].lessons = newSections[sectionIndex].lessons.filter((_, i) => i !== lessonIndex);
    setSections(newSections);
  };

  const handleAddQuiz = (sectionIndex: number) => {
    const section = sections[sectionIndex];
    setSelectedSectionForQuiz(section);
    setQuizDialogOpen(true);
  };

  const handleDeleteQuiz = async (sectionIndex: number) => {
    const section = sections[sectionIndex];
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      if (section.pendingQuiz) {
        // Remove pending quiz
        const newSections = [...sections];
        delete newSections[sectionIndex].pendingQuiz;
        setSections(newSections);
        alert('Quiz removed!');
      } else if (section.id && existingQuizzes[section.id]) {
        // Delete saved quiz
        try {
          await quizApi.deleteQuiz(section.id);
          alert('Quiz deleted successfully!');
          loadExistingQuizzes();
        } catch (error: any) {
          alert(`Failed to delete quiz: ${error.response?.data?.message || error.message}`);
        }
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Course: {course?.title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
          
          <TextField
            label="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            fullWidth
            helperText="e.g. programming, javascript, web development"
          />

          <Divider />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Course Sections</Typography>
            <Button startIcon={<AddIcon />} onClick={addSection} variant="outlined" size="small">
              Add Section
            </Button>
          </Box>

          {sections.map((section, sectionIndex) => (
            <Accordion key={sectionIndex}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{section.title || `Section ${sectionIndex + 1}`}</Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSection(sectionIndex);
                  }}
                  sx={{ ml: 'auto', mr: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Section Title"
                    value={section.title}
                    onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                    fullWidth
                  />
                  
                  <TextField
                    label="Section Description"
                    value={section.description}
                    onChange={(e) => updateSection(sectionIndex, 'description', e.target.value)}
                    multiline
                    rows={2}
                    fullWidth
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">Lessons</Typography>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => addLesson(sectionIndex)}
                      variant="outlined"
                      size="small"
                    >
                      Add Lesson
                    </Button>
                  </Box>

                  {section.lessons.map((lesson, lessonIndex) => (
                    <Box key={lesson.id || lessonIndex} sx={{ border: 1, borderColor: 'divider', p: 2, borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">Lesson {lessonIndex + 1}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => deleteLesson(sectionIndex, lessonIndex)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <TextField
                          label="Lesson Title"
                          value={lesson.title}
                          onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'title', e.target.value)}
                          fullWidth
                          size="small"
                        />
                        
                        <TextField
                          label="Content"
                          value={lesson.content}
                          onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'content', e.target.value)}
                          multiline
                          rows={2}
                          fullWidth
                          size="small"
                        />
                        
                        <TextField
                          label="Video URL (optional)"
                          value={lesson.videoUrl}
                          onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'videoUrl', e.target.value)}
                          fullWidth
                          size="small"
                          helperText="URL or Upload Video from device"
                        />
                        <Button
                          variant="outlined"
                          component="label"
                          size="small"
                        >
                          Upload
                          <input
                            type="file"
                            accept="video/*"
                            hidden
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const formData = new FormData();
                                formData.append('file', file);
                                fetch('http://localhost:8080/api/v1/files/upload', {
                                  method: 'POST',
                                  headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                                  },
                                  body: formData
                                })
                                .then(res => res.text())
                                .then(url => {
                                  updateLesson(sectionIndex, lessonIndex, 'videoUrl', url);
                                })
                                .catch(err => alert('Upload failed'));
                              }
                            }}
                          />
                        </Button>
                      </Box>
                    </Box>
                  ))}

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleAddQuiz(sectionIndex)}
                    >
                      {section.pendingQuiz || (section.id && existingQuizzes[section.id]) ? 'Edit Quiz' : 'Add Quiz'}
                    </Button>
                  </Box>

                  {section.pendingQuiz && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'secondary.50', borderRadius: 1, border: '1px solid', borderColor: 'secondary.main' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'secondary.main' }}>📝 Quiz: {section.pendingQuiz.title}</Typography>
                        <IconButton size="small" onClick={() => handleDeleteQuiz(sectionIndex)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="caption" color="text.secondary">{section.pendingQuiz.questions.length} questions</Typography>
                      <Box sx={{ mt: 1 }}>
                        {section.pendingQuiz.questions.map((q: any, idx: number) => (
                          <Typography key={idx} variant="caption" display="block" sx={{ ml: 2 }}>• {q.question}</Typography>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {!section.pendingQuiz && section.id && existingQuizzes[section.id] && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'secondary.50', borderRadius: 1, border: '1px solid', borderColor: 'secondary.main' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'secondary.main' }}>📝 Quiz: {existingQuizzes[section.id].title}</Typography>
                        <IconButton size="small" onClick={() => handleDeleteQuiz(sectionIndex)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="caption" color="text.secondary">{existingQuizzes[section.id].questions?.length || 0} questions</Typography>
                      <Box sx={{ mt: 1 }}>
                        {existingQuizzes[section.id].questions?.map((q: any, idx: number) => (
                          <Typography key={idx} variant="caption" display="block" sx={{ ml: 2 }}>• {q.question}</Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
      
      {selectedSectionForQuiz && (
        <QuizCreator
          open={quizDialogOpen}
          onClose={() => {
            setQuizDialogOpen(false);
            setSelectedSectionForQuiz(null);
          }}
          onQuizCreated={(quizData) => {
            // If section is not saved yet, store quiz data to create after section is saved
            if (selectedSectionForQuiz.id?.startsWith('temp-')) {
              const sectionIndex = sections.findIndex(s => s.id === selectedSectionForQuiz.id);
              if (sectionIndex !== -1) {
                const newSections = [...sections];
                newSections[sectionIndex].pendingQuiz = quizData;
                setSections(newSections);
              }
              alert('Quiz will be created when you save the course.');
            }
            setQuizDialogOpen(false);
            setSelectedSectionForQuiz(null);
            if (!selectedSectionForQuiz.id?.startsWith('temp-')) {
              loadExistingQuizzes();
              onSave();
            }
          }}
          sectionId={selectedSectionForQuiz.id!}
          sectionTitle={selectedSectionForQuiz.title}
          existingQuiz={selectedSectionForQuiz.pendingQuiz || (selectedSectionForQuiz.id && existingQuizzes[selectedSectionForQuiz.id])}
        />
      )}
    </Dialog>
  );
};

export default CourseEditor;
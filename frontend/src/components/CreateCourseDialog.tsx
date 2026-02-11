import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { Add, Delete, ExpandMore } from '@mui/icons-material';
import { Section, Lesson } from '../types';
import QuizCreator from './QuizCreator';

interface CourseFormData {
  title: string;
  description: string;
  tags: string;
  sections: Section[];
}

interface Quiz {
  title: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
}

interface CreateCourseDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (courseData: CourseFormData) => void;
}

const CreateCourseDialog: React.FC<CreateCourseDialogProps> = ({ open, onClose, onSubmit }) => {
  const [courseForm, setCourseForm] = useState<CourseFormData>({
    title: '',
    description: '',
    tags: '',
    sections: []
  });
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);

  const addSection = () => {
    const newSection: Section = {
      id: `temp-${Date.now()}`,
      courseId: '',
      title: '',
      description: '',
      sortOrder: courseForm.sections.length,
      lessons: [],
      quiz: null
    };
    setCourseForm({
      ...courseForm,
      sections: [...courseForm.sections, newSection]
    });
  };

  const updateSection = (index: number, field: keyof Section, value: string) => {
    const updatedSections = [...courseForm.sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setCourseForm({ ...courseForm, sections: updatedSections });
  };

  const removeSection = (index: number) => {
    const updatedSections = courseForm.sections.filter((_, i) => i !== index);
    setCourseForm({ ...courseForm, sections: updatedSections });
  };

  const addLesson = (sectionIndex: number) => {
    const newLesson: Lesson = {
      id: `temp-${Date.now()}`,
      courseId: '',
      sectionId: courseForm.sections[sectionIndex].id,
      title: '',
      content: '',
      videoUrl: '',
      sortOrder: courseForm.sections[sectionIndex].lessons?.length || 0
    };
    
    const updatedSections = [...courseForm.sections];
    updatedSections[sectionIndex].lessons = [...(updatedSections[sectionIndex].lessons || []), newLesson];
    setCourseForm({ ...courseForm, sections: updatedSections });
  };

  const updateLesson = (sectionIndex: number, lessonIndex: number, field: keyof Lesson, value: string) => {
    const updatedSections = [...courseForm.sections];
    const lessons = updatedSections[sectionIndex].lessons || [];
    lessons[lessonIndex] = { ...lessons[lessonIndex], [field]: value };
    updatedSections[sectionIndex].lessons = lessons;
    setCourseForm({ ...courseForm, sections: updatedSections });
  };

  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    const updatedSections = [...courseForm.sections];
    updatedSections[sectionIndex].lessons = updatedSections[sectionIndex].lessons?.filter((_, i) => i !== lessonIndex) || [];
    setCourseForm({ ...courseForm, sections: updatedSections });
  };

  const addQuiz = (sectionIndex: number) => {
    setSelectedSectionIndex(sectionIndex);
    setQuizDialogOpen(true);
  };

  const removeQuiz = (sectionIndex: number) => {
    const updatedSections = [...courseForm.sections];
    updatedSections[sectionIndex].quiz = null;
    setCourseForm({ ...courseForm, sections: updatedSections });
  };

  const handleSubmit = () => {
    onSubmit(courseForm);
    setCourseForm({ title: '', description: '', tags: '', sections: [] });
  };

  const handleClose = () => {
    setCourseForm({ title: '', description: '', tags: '', sections: [] });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Course</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Course Title"
          fullWidth
          variant="outlined"
          value={courseForm.title}
          onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={courseForm.description}
          onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Tags (comma separated)"
          fullWidth
          variant="outlined"
          value={courseForm.tags}
          onChange={(e) => setCourseForm({ ...courseForm, tags: e.target.value })}
          helperText="e.g. programming, beginner, web development"
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Course Sections</Typography>
          <Button startIcon={<Add />} onClick={addSection} variant="outlined" size="small">
            Add Section
          </Button>
        </Box>

        {courseForm.sections.map((section, sectionIndex) => (
          <Accordion key={section.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography sx={{ flexGrow: 1 }}>
                  {section.title || `Section ${sectionIndex + 1}`}
                </Typography>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSection(sectionIndex);
                  }}
                  size="small"
                >
                  <Delete />
                </IconButton>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                label="Section Title"
                fullWidth
                variant="outlined"
                value={section.title}
                onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Section Description"
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                value={section.description}
                onChange={(e) => updateSection(sectionIndex, 'description', e.target.value)}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Lessons</Typography>
                <Button
                  startIcon={<Add />}
                  onClick={() => addLesson(sectionIndex)}
                  variant="outlined"
                  size="small"
                >
                  Add Lesson
                </Button>
              </Box>

              {section.lessons?.map((lesson, lessonIndex) => (
                <Box key={lesson.id} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">Lesson {lessonIndex + 1}</Typography>
                    <IconButton
                      onClick={() => removeLesson(sectionIndex, lessonIndex)}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                  <TextField
                    label="Lesson Title"
                    fullWidth
                    variant="outlined"
                    value={lesson.title}
                    onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'title', e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Content"
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    value={lesson.content}
                    onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'content', e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Video URL (optional)"
                    fullWidth
                    variant="outlined"
                    value={lesson.videoUrl}
                    onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'videoUrl', e.target.value)}
                    helperText="URL or Upload Video from device"
                    size="small"
                  />
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                  >
                    Upload
                    <input
                      type="file"
                      hidden
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('file', file);
                          fetch('http://localhost:8080/api/v1/files/upload', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
                            body: formData
                          })
                            .then(res => res.text())
                            .then(url => updateLesson(sectionIndex, lessonIndex, 'videoUrl', url))
                            .catch(err => alert('Upload failed'));
                        }
                      }}
                    />
                  </Button>
                </Box>
              ))}

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => addQuiz(sectionIndex)}
                >
                  {section.quiz ? 'Edit Quiz' : 'Add Quiz'}
                </Button>
              </Box>

              {section.quiz && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'secondary.50', borderRadius: 1, border: '1px solid', borderColor: 'secondary.main' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'secondary.main' }}>📝 Quiz: {section.quiz.title}</Typography>
                    <IconButton size="small" onClick={() => removeQuiz(sectionIndex)} color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="caption" color="text.secondary">{section.quiz.questions.length} questions</Typography>
                  <Box sx={{ mt: 1 }}>
                    {section.quiz.questions.map((q: any, idx: number) => (
                      <Typography key={idx} variant="caption" display="block" sx={{ ml: 2 }}>• {q.question}</Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Create Course
        </Button>
      </DialogActions>
      
      {selectedSectionIndex !== null && (
        <QuizCreator
          open={quizDialogOpen}
          onClose={() => {
            setQuizDialogOpen(false);
            setSelectedSectionIndex(null);
          }}
          onQuizCreated={(quizData) => {
            const updatedSections = [...courseForm.sections];
            updatedSections[selectedSectionIndex!].quiz = quizData;
            setCourseForm({ ...courseForm, sections: updatedSections });
            setQuizDialogOpen(false);
            setSelectedSectionIndex(null);
          }}
          sectionId={courseForm.sections[selectedSectionIndex].id!}
          sectionTitle={courseForm.sections[selectedSectionIndex].title}
          existingQuiz={courseForm.sections[selectedSectionIndex].quiz}
        />
      )}
    </Dialog>
  );
};

export default CreateCourseDialog;
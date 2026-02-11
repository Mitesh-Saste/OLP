import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { courseService } from '../services/api';

interface Lesson {
  id?: string;
  title: string;
  content: string;
  videoUrl: string;
  sortOrder: number;
}

interface LessonManagerProps {
  courseId: string;
  lessons: Lesson[];
  onLessonsUpdate: () => void;
}

export const LessonManager: React.FC<LessonManagerProps> = ({
  courseId,
  lessons,
  onLessonsUpdate,
}) => {
  const [open, setOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState<Lesson>({
    title: '',
    content: '',
    videoUrl: '',
    sortOrder: lessons.length + 1,
  });

  const handleSubmit = async () => {
    try {
      if (editingLesson?.id) {
        await courseService.updateLesson(courseId, editingLesson.id, formData);
      } else {
        await courseService.addLesson(courseId, formData);
      }
      onLessonsUpdate();
      handleClose();
    } catch (error) {
      console.error('Error saving lesson:', error);
    }
  };

  const handleDelete = async (lessonId: string) => {
    try {
      await courseService.deleteLesson(courseId, lessonId);
      onLessonsUpdate();
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingLesson(null);
    setFormData({
      title: '',
      content: '',
      videoUrl: '',
      sortOrder: lessons.length + 1,
    });
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData(lesson);
    setOpen(true);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Lessons</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Lesson
        </Button>
      </Box>

      {lessons.map((lesson) => (
        <Card key={lesson.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="start">
              <Box>
                <Typography variant="h6">{lesson.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Order: {lesson.sortOrder}
                </Typography>
                {lesson.videoUrl && (
                  <Typography variant="body2" color="primary">
                    Video: {lesson.videoUrl}
                  </Typography>
                )}
              </Box>
              <Box>
                <IconButton onClick={() => handleEdit(lesson)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(lesson.id!)}>
                  <Delete />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            label="Video URL"
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Sort Order"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingLesson ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
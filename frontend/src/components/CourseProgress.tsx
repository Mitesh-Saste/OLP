import React, { useState, useEffect } from 'react';
import { Typography, LinearProgress, Box } from '@mui/material';
import { progressApi } from '../services/api';
import { CheckCircle } from '@mui/icons-material';

interface ProgressData {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
}

interface CourseProgressProps {
  courseId: string;
}

const CourseProgress: React.FC<CourseProgressProps> = ({ courseId }) => {
  const [progress, setProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    loadProgress();
  }, [courseId]);

  const loadProgress = async () => {
    try {
      const response = await progressApi.getCourseProgress(courseId);
      setProgress(response.data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  if (!progress) return null;

  return (
    <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="body2" fontWeight={600}>
            {progress.completedLessons}/{progress.totalLessons} lessons
          </Typography>
        </Box>
        <Typography variant="body2" fontWeight={600} color="primary.main">
          {Math.round(progress.progressPercent)}%
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={progress.progressPercent} sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(99, 102, 241, 0.1)', '& .MuiLinearProgress-bar': { borderRadius: 4, background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' } }} />
    </Box>
  );
};

export default CourseProgress;
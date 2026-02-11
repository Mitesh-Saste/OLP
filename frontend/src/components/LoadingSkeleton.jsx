import React from 'react';
import { Box, Card, CardContent, Skeleton, Grid } from '@mui/material';

export const CourseCardSkeleton = () => (
  <Card sx={{ height: '100%' }}>
    <Skeleton variant="rectangular" height={200} animation="wave" />
    <CardContent>
      <Skeleton variant="text" height={32} width="80%" animation="wave" />
      <Skeleton variant="text" height={20} width="100%" animation="wave" sx={{ mt: 1 }} />
      <Skeleton variant="text" height={20} width="90%" animation="wave" />
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Skeleton variant="rounded" width={60} height={24} animation="wave" />
        <Skeleton variant="rounded" width={80} height={24} animation="wave" />
      </Box>
      <Skeleton variant="rounded" height={36} width="100%" animation="wave" sx={{ mt: 2 }} />
    </CardContent>
  </Card>
);

export const CourseGridSkeleton = () => (
  <Grid container spacing={3}>
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Grid item xs={12} sm={6} md={4} key={i}>
        <CourseCardSkeleton />
      </Grid>
    ))}
  </Grid>
);


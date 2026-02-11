import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { School } from '@mui/icons-material';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'STUDENT' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authApi.register(formData);
      const { accessToken, refreshToken, username, role } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('username', username);
      localStorage.setItem('role', role);
      
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: 5, borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <School sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Join RSCOE Wallah
            </Typography>
            <Typography variant="body2" color="text.secondary">Create your account to start learning</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Username" margin="normal" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Email" type="email" margin="normal" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Password" type="password" margin="normal" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required sx={{ mb: 2 }} />
            <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
              <InputLabel>Role</InputLabel>
              <Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <MenuItem value="STUDENT">Student</MenuItem>
                <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
              </Select>
            </FormControl>
            <Button type="submit" fullWidth variant="contained" size="large" sx={{ py: 1.5, fontSize: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              Create Account
            </Button>
            <Typography align="center" sx={{ mt: 3 }} color="text.secondary">
              Already have an account? <Link to="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
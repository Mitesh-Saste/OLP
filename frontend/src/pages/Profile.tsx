import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Card, CardContent, TextField, Button, Avatar, Alert, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Person, PhotoCamera, Lock } from '@mui/icons-material';
import { profileApi } from '../services/api';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileApi.getProfile();
      setProfile(response.data);
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email || '',
      });
    } catch (error) {
      setError('Failed to load profile');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await profileApi.updateProfile(formData);
      setMessage('Profile updated successfully!');
      loadProfile();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await profileApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage('Password changed successfully!');
      setOpenPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://localhost:8080/api/v1/files/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        body: formData,
      });
      const url = await response.text();
      await profileApi.updateProfile({ profilePicture: url });
      loadProfile();
      setMessage('Profile picture updated!');
    } catch (error) {
      setError('Failed to upload picture');
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>My Profile</Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>Manage your account settings</Typography>
        </Container>
      </Box>
      <Container maxWidth="md" sx={{ mt: -4 }}>
        {message && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setMessage('')}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
        
        <Card sx={{ mb: 3, borderRadius: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar src={profile.profilePicture} sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}>
                  <Person sx={{ fontSize: 60 }} />
                </Avatar>
                <Button component="label" sx={{ position: 'absolute', bottom: 0, right: 0, minWidth: 36, width: 36, height: 36, borderRadius: '50%', bgcolor: 'white', color: 'primary.main', boxShadow: 2, '&:hover': { bgcolor: 'grey.100' } }} disabled={uploading}>
                  <PhotoCamera sx={{ fontSize: 18 }} />
                  <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                </Button>
              </Box>
              <Box sx={{ ml: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>{profile.username}</Typography>
                <Typography variant="body2" color="text.secondary">{profile.role}</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box component="form" onSubmit={handleUpdateProfile}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Personal Information</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <TextField label="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                <TextField label="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </Box>
              <TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} sx={{ mb: 3 }} />
              <Button type="submit" variant="contained" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>Save Changes</Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Security</Typography>
            <Button variant="outlined" startIcon={<Lock />} onClick={() => setOpenPasswordDialog(true)}>Change Password</Button>
          </CardContent>
        </Card>
      </Container>

      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Current Password" type="password" margin="normal" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
          <TextField fullWidth label="New Password" type="password" margin="normal" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
          <TextField fullWidth label="Confirm New Password" type="password" margin="normal" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained">Change Password</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;

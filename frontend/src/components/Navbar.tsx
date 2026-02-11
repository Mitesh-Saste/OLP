import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { School, AccountCircle } from '@mui/icons-material';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <AppBar position="static" elevation={0} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <Toolbar sx={{ py: 1 }}>
        <School sx={{ mr: 1.5, fontSize: 32 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
          RSCOE Wallah
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button color="inherit" onClick={() => navigate('/')} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
            Courses
          </Button>
          {role === 'STUDENT' && (
            <Button color="inherit" onClick={() => navigate('/my-courses')} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              My Learning
            </Button>
          )}
          {role === 'INSTRUCTOR' && (
            <Button color="inherit" onClick={() => navigate('/instructor')} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              Dashboard
            </Button>
          )}
          {role === 'ADMIN' && (
            <Button color="inherit" onClick={() => navigate('/admin')} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              Admin
            </Button>
          )}
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
            <AccountCircle />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
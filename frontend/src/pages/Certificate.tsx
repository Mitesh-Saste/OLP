import React, { useEffect, useState, useRef } from 'react';
import { Container, Box, Button, CircularProgress, Typography } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { certificateApi } from '../services/api';
import { Download } from '@mui/icons-material';

const Certificate: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<any>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (courseId) {
      loadCertificate();
    }
  }, [courseId]);

  const loadCertificate = async () => {
    try {
      const response = await certificateApi.getCertificate(courseId!);
      if (response.data.eligible) {
        setCertificate(response.data);
      } else {
        alert(response.data.reason || 'Not eligible for certificate');
        navigate(-1);
      }
    } catch (error) {
      console.error('Failed to load certificate:', error);
      alert('Failed to load certificate');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = () => {
    if (!certificateRef.current) return;
    
    import('html2canvas').then((html2canvas) => {
      html2canvas.default(certificateRef.current!, { scale: 2 }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `certificate-${certificate.certificateNumber}.png`;
        link.href = canvas.toDataURL();
        link.click();
      });
    });
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!certificate) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Button variant="contained" startIcon={<Download />} onClick={downloadCertificate} sx={{ mr: 2 }}>
          Download Certificate
        </Button>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Back to Course
        </Button>
      </Box>

      <Box
        ref={certificateRef}
        sx={{
          width: '1056px',
          height: '816px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '20px solid #fff',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative corners */}
        <Box sx={{ position: 'absolute', top: 40, left: 40, width: 100, height: 100, border: '3px solid rgba(255,255,255,0.3)', borderRight: 'none', borderBottom: 'none' }} />
        <Box sx={{ position: 'absolute', top: 40, right: 40, width: 100, height: 100, border: '3px solid rgba(255,255,255,0.3)', borderLeft: 'none', borderBottom: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: 40, left: 40, width: 100, height: 100, border: '3px solid rgba(255,255,255,0.3)', borderRight: 'none', borderTop: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: 40, right: 40, width: 100, height: 100, border: '3px solid rgba(255,255,255,0.3)', borderLeft: 'none', borderTop: 'none' }} />

        {/* Content */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white', textAlign: 'center', px: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, letterSpacing: 2 }}>
            RSCOE WALLAH
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Online Learning Platform
          </Typography>

          <Typography variant="h4" sx={{ fontWeight: 300, mb: 4, letterSpacing: 4 }}>
            CERTIFICATE OF COMPLETION
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, fontSize: 18 }}>
            This is to certify that
          </Typography>

          <Typography variant="h3" sx={{ fontWeight: 700, mb: 4, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            {certificate.studentName}
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, fontSize: 18 }}>
            has successfully completed the course
          </Typography>

          <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
            {certificate.courseName}
          </Typography>

          <Typography variant="body1" sx={{ mb: 1, fontSize: 16 }}>
            Instructed by <strong>{certificate.instructorName}</strong>
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 6 }}>
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Issue Date</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>{certificate.issueDate}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Certificate Number</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>{certificate.certificateNumber}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Certificate;

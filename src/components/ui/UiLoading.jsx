import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const UiLoading = ({ 
  overlay = true, 
  fixed = false,
  size = 60,
}) => {
  return (
    <Box
      sx={{
        position: fixed ? 'fixed' : (overlay ? 'absolute' : 'relative'),
        inset: 0,
        zIndex: fixed ? 9999 : 1400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: overlay || fixed ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
        backdropFilter: 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <Box 
        sx={{ 
          width: size, 
          height: size, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <CircularProgress size={size} thickness={2} color="primary" />
      </Box>
    </Box>
  );
};

export default UiLoading;

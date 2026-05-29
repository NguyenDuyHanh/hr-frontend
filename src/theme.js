import { createTheme } from '@mui/material/styles';

// Khởi tạo bảng màu sáng/tối đồng bộ hệ thống thiết kế Steel Blue & Red-Orange
export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#1976D2' : '#66B3FF',  // Light: #1976D2, Dark: #66B3FF
      light: mode === 'light' ? '#42a5f5' : '#99ccff',
      dark: mode === 'light' ? '#1565c0' : '#3399ff',
      contrastText: mode === 'light' ? '#fff' : '#0A192F',
    },
    secondary: {
      main: mode === 'light' ? '#c94a38' : '#ec6252',  // Keep existing secondary
      contrastText: '#fff',
    },
    background: {
      default: mode === 'light' ? '#f8fafc' : '#0F1214', // MUI light and deep dark charcoal #0F1214
      paper: mode === 'light' ? '#ffffff' : '#181C20',   // Lighter charcoal card background
    },
    text: {
      primary: mode === 'light' ? '#1A2027' : '#f8fafc',
      secondary: mode === 'light' ? '#5f6c7d' : '#94a3b8',
    },
    divider: mode === 'light' ? 'hsla(220, 10%, 6%, 1.00)' : 'rgba(61, 71, 81, 0.3)',
    action: {
      hover: mode === 'light' ? 'rgba(0, 127, 255, 0.04)' : 'rgba(51, 153, 255, 0.08)',
      selected: mode === 'light' ? 'rgba(0, 127, 255, 0.08)' : 'rgba(51, 153, 255, 0.16)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Inter", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h1: { fontSize: '2rem', fontWeight: 600 },
    h2: { fontSize: '1.5rem', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          height: '32px',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: `1px solid ${mode === 'light' ? '#e5eaf2' : '#173a5e'}`,
          '&:not(:last-child)': {
            borderBottom: 0,
          },
          '&:before': { display: 'none' },
          backgroundColor: mode === 'light' ? '#ffffff' : '#001e3c',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: mode === 'light' 
            ? '0px 2px 8px rgba(0, 0, 0, 0.04)' 
            : '0px 2px 8px rgba(0, 0, 0, 0.25)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: mode === 'light' ? '#e5eaf2' : '#173a5e',
        },
      },
    },
  },
});

// Default theme for fallback
const theme = createTheme(getDesignTokens('light'));
export default theme;

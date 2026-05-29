import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { getDesignTokens } from './theme'
import App from './App'
import './index.css'
import useThemeStore from './store/themeStore'

const MainApp = () => {
  const mode = useThemeStore((state) => state.mode);
  
  // Tạo theme động dựa vào chế độ sáng/tối hiện tại
  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <MainApp />
  // </React.StrictMode>,
)

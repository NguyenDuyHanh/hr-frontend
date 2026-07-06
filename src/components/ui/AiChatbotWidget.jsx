import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
// Default transport is natively managed by useChat
import ReactMarkdown from 'react-markdown';
import {
  Fab,
  Drawer,
  IconButton,
  TextField,
  Button,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  CircularProgress,
  Box,
  Stack,
  Typography,
  Paper,
  Chip
} from '@mui/material';
import {
  AutoAwesome,
  Close,
  Settings,
  Send,
  Person,
  SmartToy,
  HelpOutline
} from '@mui/icons-material';
import ConstantList from '../../appConfig';
import useAuthStore from '../../store/useAuthStore';
import * as AuthService from '../../services/AuthService';

// Check if JWT token is expired (with 10-second buffer)
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const { exp } = JSON.parse(jsonPayload);
    return Date.now() >= (exp * 1000 - 10000); // 10-second buffer
  } catch (error) {
    return true;
  }
};

// Proactively refresh access token if expired or near expiration
const refreshTokenIfNeeded = async () => {
  const { accessToken, refreshToken, setAuth, user, logout } = useAuthStore.getState();
  if (!accessToken || isTokenExpired(accessToken)) {
    if (refreshToken) {
      try {
        const response = await AuthService.refreshToken(refreshToken);
        if (response.data && response.data.status === 200) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
          setAuth(user, newAccessToken, newRefreshToken || refreshToken);
          return newAccessToken;
        }
      } catch (err) {
        console.error("Failed to refresh token inside AI Chatbot Widget:", err);
      }
    }
    // If we cannot refresh, clear auth and force login redirect
    logout();
    return null;
  }
  return accessToken;
};

const AiChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Persisted state
  const [model, setModel] = useState(() => localStorage.getItem('groq_model') || 'llama-3.3-70b-versatile');
  
  // Local inputs for settings
  const [tempModel, setTempModel] = useState(model);

  const messagesEndRef = useRef(null);
  
  // Custom fetch function that dynamically injects Authorization header and refreshes token if needed
  const customFetch = async (url, options) => {
    const token = await refreshTokenIfNeeded();
    const headers = {
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, {
      ...options,
      headers
    });
  };

  // Configure useChat hook natively
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: ConstantList.API_ENPOINT + '/chat',
    body: { model },
    fetch: customFetch
  });

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSaveSettings = () => {
    localStorage.setItem('groq_model', tempModel);
    setModel(tempModel);
    setShowSettings(false);
  };

  const handlePromptSuggestion = (text) => {
    // Manually trigger submission using custom event object or direct injection
    const fakeEvent = {
      preventDefault: () => {},
    };
    // Update input state and submit
    handleInputChange({ target: { value: text } });
    setTimeout(() => {
      handleSubmit(fakeEvent, { 
        body: { model }
      });
    }, 50);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Tooltip title="Trợ lý AI HRM" placement="left">
        <Fab
          color="primary"
          aria-label="ai-chat"
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            height: 40,
            width: 40,
            zIndex: 1000,
            background: 'var(--gradient-primary)',
            boxShadow: 'var(--shadow-glow)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              background: 'var(--gradient-primary)',
              opacity: 0.95,
            },
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { boxShadow: '0 0 0 0 hsl(var(--primary) / 0.4)' },
              '70%': { boxShadow: '0 0 0 15px hsl(var(--primary) / 0)' },
              '100%': { boxShadow: '0 0 0 0 hsl(var(--primary) / 0)' }
            }
          }}
        >
          <AutoAwesome sx={{ color: 'hsl(var(--primary-foreground))' }} />
        </Fab>
      </Tooltip>

      {/* Chat Drawer Panel */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 420 },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-soft)',
            borderLeft: '1px solid hsl(var(--border))',
            bgcolor: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
          }
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            background: 'var(--gradient-primary)',
            color: 'hsl(var(--primary-foreground))',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-soft)'
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <AutoAwesome sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                Trợ lý AI HRM
              </Typography>
              <Typography variant="caption" sx={{ color: 'hsl(var(--primary-foreground) / 0.8)' }}>
                Powered by Groq LLM
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={() => setShowSettings(!showSettings)} sx={{ color: 'inherit' }}>
              <Settings fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'inherit' }}>
              <Close fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        {/* Settings Panel Overlay */}
        {showSettings && (
          <Box sx={{ p: 2, bgcolor: 'hsl(var(--muted))', borderBottom: '1px solid hsl(var(--border))' }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, color: 'hsl(var(--foreground))' }}>
              <Settings fontSize="small" /> Cấu hình Trợ lý AI
            </Typography>
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: 'hsl(var(--muted-foreground))' }}>Mô hình AI</InputLabel>
                <Select
                  value={tempModel}
                  label="Mô hình AI"
                  onChange={(e) => setTempModel(e.target.value)}
                  sx={{
                    color: 'hsl(var(--foreground))',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'hsl(var(--border))' }
                  }}
                >
                  <MenuItem value="llama-3.3-70b-versatile">LLaMA 3.3 70B (Mới nhất & Thông minh nhất)</MenuItem>
                  <MenuItem value="llama-3.1-8b-instant">LLaMA 3.1 8B (Nhanh & Tối ưu)</MenuItem>
                  <MenuItem value="mixtral-8x7b-32768">Mixtral 8x7B (Xử lý Context lớn)</MenuItem>
                </Select>
              </FormControl>
              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button size="small" variant="outlined" onClick={() => setShowSettings(false)} sx={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}>
                  Hủy
                </Button>
                <Button size="small" variant="contained" onClick={handleSaveSettings} sx={{ bgcolor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', '&:hover': { bgcolor: 'hsl(var(--primary-light))' } }}>
                  Lưu cấu hình
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}

        {/* Messages Body */}
        <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: 'hsl(var(--background))', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Welcome Message */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary-foreground))', flexShrink: 0 }}>
              <SmartToy fontSize="small" />
            </Box>
            <Paper sx={{ p: 1.5, borderRadius: 2, borderTopLeftRadius: 0, maxWidth: '85%', bgcolor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-soft)' }}>
              <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                Xin chào! Tôi là Trợ lý AI có thể giúp bạn tra cứu thông tin nhân viên, cơ cấu phòng ban và giải đáp các quy trình nghiệp vụ HRM. Bạn cần tìm hiểu thông tin gì?
              </Typography>
            </Paper>
          </Box>

          {/* List of Messages */}
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'flex-start',
                  flexDirection: isUser ? 'row-reverse' : 'row'
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: isUser ? 'hsl(var(--accent))' : 'hsl(var(--primary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isUser ? 'hsl(var(--accent-foreground))' : 'hsl(var(--primary-foreground))',
                    flexShrink: 0
                  }}
                >
                  {isUser ? <Person fontSize="small" /> : <SmartToy fontSize="small" />}
                </Box>

                <Paper
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    borderTopRightRadius: isUser ? 0 : 8,
                    borderTopLeftRadius: isUser ? 8 : 0,
                    maxWidth: '85%',
                    bgcolor: isUser ? 'hsl(var(--primary))' : 'hsl(var(--card))',
                    color: isUser ? 'hsl(var(--primary-foreground))' : 'hsl(var(--card-foreground))',
                    border: isUser ? 'none' : '1px solid hsl(var(--border))',
                    boxShadow: 'var(--shadow-soft)',
                    overflowX: 'auto'
                  }}
                >
                  {isUser ? (
                    <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                      {message.parts ? message.parts.map((p) => p.text).join('') : message.content}
                    </Typography>
                  ) : (
                    <Box sx={{ 
                      '& table': { minWidth: '100%', borderCollapse: 'collapse', mt: 1, mb: 1 }, 
                      '& th, & td': { border: '1px solid hsl(var(--border))', p: 1, fontSize: '0.75rem' }, 
                      '& th': { bgcolor: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }, 
                      '& td': { color: 'hsl(var(--foreground))' },
                      '& p': { m: 0, mb: 1, '&:last-child': { mb: 0 } }, 
                      '& ul, & ol': { m: 0, pl: 2, mb: 1 } 
                    }}>
                      <ReactMarkdown>
                        {message.parts ? message.parts.map((p) => p.text).join('') : message.content}
                      </ReactMarkdown>
                    </Box>
                  )}
                </Paper>
              </Box>
            );
          })}

          {isLoading && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'hsl(var(--muted-foreground))' }}>
              <CircularProgress size={14} color="inherit" />
              <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                AI đang suy nghĩ và tra cứu dữ liệu...
              </Typography>
            </Stack>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Clear History Button */}
        {messages.length > 0 && (
          <Box sx={{ p: 1, px: 2, display: 'flex', justifyContent: 'flex-end', bgcolor: 'hsl(var(--card))', borderTop: '1px solid hsl(var(--border))' }}>
            <Chip
              label="Xóa lịch sử"
              size="small"
              onClick={() => setMessages([])}
              sx={{ 
                bgcolor: 'hsl(var(--destructive) / 0.15)', 
                color: 'hsl(var(--destructive))', 
                '&:hover': { bgcolor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }, 
                cursor: 'pointer' 
              }}
            />
          </Box>
        )}

        {/* Message Input Form */}
        <Divider />
        <Box
          component="form"
          onSubmit={(e) => handleSubmit(e, { 
            body: { model }
          })}
          sx={{ p: 1.5, bgcolor: 'hsl(var(--card))', display: 'flex', gap: 1, alignItems: 'center' }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Hỏi AI về thông tin nhân sự..."
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                borderRadius: 5,
                color: 'hsl(var(--foreground))',
                '& fieldset': { borderColor: 'hsl(var(--border))' },
                '&:hover fieldset': { borderColor: 'hsl(var(--primary))' },
              } 
            }}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            sx={{
              minWidth: 40,
              width: 40,
              height: 40,
              borderRadius: '50%',
              p: 0,
              bgcolor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              '&:hover': { bgcolor: 'hsl(var(--primary-light))' },
              '&.Mui-disabled': {
                bgcolor: 'hsl(var(--muted))',
                color: 'hsl(var(--muted-foreground) / 0.5)'
              }
            }}
          >
            <Send fontSize="small" />
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default AiChatbotWidget;

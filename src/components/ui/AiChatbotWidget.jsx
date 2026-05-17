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

const AiChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Persisted state
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq_api_key') || '');
  const [model, setModel] = useState(() => localStorage.getItem('groq_model') || 'llama-3.3-70b-versatile');
  
  // Local inputs for settings
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempModel, setTempModel] = useState(model);

  const messagesEndRef = useRef(null);

  // Configure useChat hook natively
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: ConstantList.API_ENPOINT + '/api/chat',
    body: { apiKey, model }
  });

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSaveSettings = () => {
    localStorage.setItem('groq_api_key', tempApiKey);
    localStorage.setItem('groq_model', tempModel);
    setApiKey(tempApiKey);
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
      handleSubmit(fakeEvent, { body: { apiKey, model } });
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
            background: 'linear-gradient(135deg, #4276a4 0%, #2d5f88 100%)',
            boxShadow: '0 8px 24px rgba(66, 118, 164, 0.4)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              background: 'linear-gradient(135deg, #4a83b6 0%, #2d5f88 100%)',
            },
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { boxShadow: '0 0 0 0 rgba(66, 118, 164, 0.5)' },
              '70%': { boxShadow: '0 0 0 15px rgba(66, 118, 164, 0)' },
              '100%': { boxShadow: '0 0 0 0 rgba(66, 118, 164, 0)' }
            }
          }}
        >
          <AutoAwesome sx={{ color: '#fff' }} />
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
            boxShadow: '-5px 0 25px rgba(0,0,0,0.1)'
          }
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            background: '#2d5f88',
            color: '#fff',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 2
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <AutoAwesome sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                Trợ lý AI HRM
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Powered by Groq LLM
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={() => setShowSettings(!showSettings)} sx={{ color: '#fff' }}>
              <Settings fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: '#fff' }}>
              <Close fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        {/* Settings Panel Overlay */}
        {showSettings && (
          <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, color: '#334155' }}>
              <Settings fontSize="small" /> Cấu hình Trợ lý AI
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="Groq API Key (Tùy chọn)"
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="gsk_..."
                helperText="Bỏ trống để dùng key mặc định của hệ thống"
              />
              <FormControl fullWidth size="small">
                <InputLabel>Mô hình AI</InputLabel>
                <Select
                  value={tempModel}
                  label="Mô hình AI"
                  onChange={(e) => setTempModel(e.target.value)}
                >
                  <MenuItem value="llama-3.3-70b-versatile">LLaMA 3.3 70B (Mới nhất & Thông minh nhất)</MenuItem>
                  <MenuItem value="llama-3.1-8b-instant">LLaMA 3.1 8B (Nhanh & Tối ưu)</MenuItem>
                  <MenuItem value="mixtral-8x7b-32768">Mixtral 8x7B (Xử lý Context lớn)</MenuItem>
                </Select>
              </FormControl>
              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button size="small" variant="outlined" onClick={() => setShowSettings(false)}>
                  Hủy
                </Button>
                <Button size="small" variant="contained" onClick={handleSaveSettings}>
                  Lưu cấu hình
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}

        {/* Messages Body */}
        <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Welcome Message */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#2a5298', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
              <SmartToy fontSize="small" />
            </Box>
            <Paper sx={{ p: 1.5, borderRadius: 2, borderTopLeftRadius: 0, maxWidth: '85%', bgcolor: '#fff', boxShadow: 1 }}>
              <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.5 }}>
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
                    bgcolor: isUser ? '#0284c7' : '#2a5298',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
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
                    bgcolor: isUser ? '#0284c7' : '#fff',
                    color: isUser ? '#fff' : '#334155',
                    boxShadow: 1,
                    overflowX: 'auto'
                  }}
                >
                  {isUser ? (
                    <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                      {message.parts ? message.parts.map((p) => p.text).join('') : message.content}
                    </Typography>
                  ) : (
                    <Box sx={{ '& table': { minWidth: '100%', borderCollapse: 'collapse', mt: 1, mb: 1 }, '& th, & td': { border: '1px solid #e2e8f0', p: 1, fontSize: '0.75rem' }, '& th': { bgcolor: '#f1f5f9' }, '& p': { m: 0, mb: 1, '&:last-child': { mb: 0 } }, '& ul, & ol': { m: 0, pl: 2, mb: 1 } }}>
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
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#94a3b8' }}>
              <CircularProgress size={14} color="inherit" />
              <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                AI đang suy nghĩ và tra cứu dữ liệu...
              </Typography>
            </Stack>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Prompt Suggestions */}
        <Box sx={{ p: 1.5, bgcolor: '#fff', borderTop: '1px solid #f1f5f9' }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <HelpOutline fontSize="inherit" /> Gợi ý tra cứu nhanh:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {[
              '🏢 Danh sách phòng ban',
              '👥 Toàn bộ nhân viên',
              '🔍 Nhân viên phòng IT',
              '📊 Thống kê nhân sự'
            ].map((text) => (
              <Chip
                key={text}
                label={text}
                size="small"
                onClick={() => handlePromptSuggestion(text.replace(/^[^\s]+\s/, ''))}
                sx={{ bgcolor: '#f1f5f9', color: '#475569', '&:hover': { bgcolor: '#2a5298', color: '#fff' }, cursor: 'pointer' }}
              />
            ))}
            {messages.length > 0 && (
              <Chip
                label="Xóa lịch sử"
                size="small"
                onClick={() => setMessages([])}
                sx={{ bgcolor: '#fee2e2', color: '#ef4444', ml: 'auto', '&:hover': { bgcolor: '#dc2626', color: '#fff' }, cursor: 'pointer' }}
              />
            )}
          </Box>
        </Box>

        {/* Message Input Form */}
        <Divider />
        <Box
          component="form"
          onSubmit={(e) => handleSubmit(e, { body: { apiKey, model } })}
          sx={{ p: 1.5, bgcolor: '#fff', display: 'flex', gap: 1, alignItems: 'center' }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Hỏi AI về thông tin nhân sự..."
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 5 } }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!input.trim() || isLoading}
            sx={{
              minWidth: 40,
              width: 40,
              height: 40,
              borderRadius: '50%',
              p: 0,
              bgcolor: '#2a5298',
              '&:hover': { bgcolor: '#1e3c72' }
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

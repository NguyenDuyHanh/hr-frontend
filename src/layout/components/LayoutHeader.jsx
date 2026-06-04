import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import IconButton from '@mui/material/IconButton'
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import AppsIcon from '@mui/icons-material/Apps'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import useThemeStore from '@/store/themeStore'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import useSidebarStore from '@/store/sidebarStore'
import useAuthStore from '@/store/useAuthStore'
import UiConfirmationDialog from '@/components/ui/UiConfirmationDialog'

const LayoutHeader = () => {
  const { toggleCollapsed, toggleMobileOpen } = useSidebarStore();
  const { user, logout } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const handleToggle = () => {
    if (window.innerWidth < 768) {
      toggleMobileOpen();
    } else {
      toggleCollapsed();
    }
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleClose();
    setShowConfirmLogout(true);
  };

  const handleConfirmLogout = () => {
    logout();
  };

  // Helper to extract initials from full name or username
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className='bg-card h-[48px] flex items-center justify-between px-4 text-foreground border-b border-border shadow-sm'>
      {/* Left side: Logo and Toggle */}
      <div className='flex items-center md:ml-10 space-x-6'>
        <NavLink to="/dashboard" className='bg-primary text-primary-foreground px-4 py-1 rounded-md font-bold text-[18px] tracking-widest no-underline hidden md:block shadow-sm hover:opacity-95'>
          H R M
        </NavLink>
 
        <IconButton size="small" className='text-primary !ml-0 md:!ml-6' onClick={handleToggle}>
          <MenuOutlinedIcon fontSize="medium" />
        </IconButton>
 
        <span className='font-medium text-[16px] text-primary ml-2 hidden md:block'>
          {user?.fullName || user?.username || 'HANHND_TLU_K64'}
        </span>
      </div>
 
      {/* Right side: Actions */}
      <div className='flex items-center space-x-4'>
        <div className='flex items-center bg-muted hover:bg-muted/80 text-primary px-2.5 py-1.5 rounded-md cursor-pointer border border-border'>
          <MailOutlineIcon sx={{ fontSize: '18px' }} />
        </div>
 
        <div className='flex items-center bg-muted hover:bg-muted/80 text-primary px-2.5 py-1.5 rounded-md cursor-pointer relative border border-border'>
          <NotificationsNoneIcon sx={{ fontSize: '18px' }} />
          <span className='absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-card'></span>
        </div>
 
        <div className='flex items-center bg-muted hover:bg-muted/80 text-primary px-2.5 py-1.5 rounded-md cursor-pointer border border-border'>
          <AppsIcon sx={{ fontSize: '18px' }} />
        </div>
 
        {/* Nút bật/tắt chế độ Sáng/Tối phong cách MUI */}
        <div 
          onClick={toggleTheme}
          className='flex items-center bg-muted hover:bg-muted/80 text-primary px-2.5 py-1.5 rounded-md cursor-pointer border border-border'
          title={mode === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
        >
          {mode === 'light' ? <DarkModeIcon sx={{ fontSize: '18px' }} /> : <LightModeIcon sx={{ fontSize: '18px' }} />}
        </div>
 
        {/* Avatar Trigger with dynamic initials */}
        <div 
          onClick={handleAvatarClick}
          className='w-8 h-8 rounded-full bg-primary text-primary-foreground hover:opacity-90 active:scale-95 flex items-center justify-center text-[12px] border border-border cursor-pointer font-bold ml-2 shadow-sm'
        >
          {getInitials(user?.fullName || user?.username)}
        </div>

        {/* User Profile Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          id="user-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
              mt: 1.5,
              width: 220,
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullName || 'Người dùng'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              @{user?.username || 'user'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 500, fontSize: '11px', mt: 0.5 }}>
              Vị trí: {user?.role || 'Nhân viên'}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleClose} sx={{ fontSize: '14px', py: 1 }}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Hồ sơ cá nhân
          </MenuItem>
          <MenuItem onClick={handleClose} sx={{ fontSize: '14px', py: 1 }}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Thiết lập tài khoản
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={handleLogoutClick} 
            sx={{ 
              fontSize: '14px', 
              py: 1,
              color: '#d32f2f',
              '&:hover': {
                bgcolor: '#fde8e8',
              }
            }}
          >
            <ListItemIcon sx={{ color: '#d32f2f' }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Đăng xuất
          </MenuItem>
        </Menu>

        {/* Confirmation Dialog for Logging out */}
        <UiConfirmationDialog
          open={showConfirmLogout}
          onConfirmDialogClose={() => setShowConfirmLogout(false)}
          title="Xác nhận đăng xuất"
          text="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?"
          agree="Đăng xuất"
          cancel="Hủy"
          onYesClick={handleConfirmLogout}
        />
      </div>
    </div>
  )
}

export default LayoutHeader


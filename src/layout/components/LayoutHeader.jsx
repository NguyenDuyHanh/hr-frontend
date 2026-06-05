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
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import useSidebarStore from '@/store/sidebarStore'
import useAuthStore from '@/store/useAuthStore'
import UiConfirmationDialog from '@/components/ui/UiConfirmationDialog'
import UiAvatar from '@/components/ui/UiAvatar'

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

  return (
    <div className='bg-background h-[48px] flex items-center justify-between px-4 text-foreground border-b border-border shadow-sm'>
      {/* Left side: Logo and Toggle */}
      <div className='flex items-center md:ml-10 space-x-6'>
        <NavLink to="/dashboard" className='bg-primary text-primary-foreground px-4 py-1 rounded-md font-bold text-[18px] tracking-widest no-underline hidden md:block shadow-sm hover:opacity-95'>
          H R M
        </NavLink>
 
        <IconButton size="small" className='text-primary !ml-0 md:!ml-12' onClick={handleToggle}>
          <MenuOutlinedIcon fontSize="medium" />
        </IconButton>
 
        <span className='font-medium text-[18px] text-primary !ml-3 hidden md:block'>
          {user?.fullName || user?.username || 'Unknown User'}
        </span>
      </div>
 
      {/* Right side: Actions */}
      <div className='flex items-center space-x-4'>
        <div className='flex items-center bg-muted hover:bg-primary/10 dark:hover:bg-primary/20 text-primary px-2.5 py-1.5 rounded-md cursor-pointer border border-border'>
          <MailOutlineIcon sx={{ fontSize: '18px' }} />
        </div>
 
        <div className='flex items-center bg-muted hover:bg-primary/10 dark:hover:bg-primary/20 text-primary px-2.5 py-1.5 rounded-md cursor-pointer relative border border-border'>
          <NotificationsNoneIcon sx={{ fontSize: '18px' }} />
          <span className='absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-background'></span>
        </div>
 
        <div className='flex items-center bg-muted hover:bg-primary/10 dark:hover:bg-primary/20 text-primary px-2.5 py-1.5 rounded-md cursor-pointer border border-border'>
          <AppsIcon sx={{ fontSize: '18px' }} />
        </div>
 
        {/* Nút bật/tắt chế độ Sáng/Tối phong cách MUI */}
        <div 
          onClick={toggleTheme}
          className='flex items-center bg-muted hover:bg-primary/10 dark:hover:bg-primary/20 text-primary px-2.5 py-1.5 rounded-md cursor-pointer border border-border'
          title={mode === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
        >
          {mode === 'light' ? <DarkModeIcon sx={{ fontSize: '18px' }} /> : <LightModeIcon sx={{ fontSize: '18px' }} />}
        </div>
 
        {/* Avatar Trigger with dynamic initials or image */}
        <div 
          onClick={handleAvatarClick}
          className='w-8 h-8 rounded-full hover:opacity-90 active:scale-95 flex items-center justify-center border border-border cursor-pointer ml-2 shadow-sm overflow-hidden'
        >
          <UiAvatar 
            name={user?.fullName || user?.username} 
            imgPath={user?.imagePath} 
            className="w-full h-full text-[12px] font-bold" 
          />
        </div>

        {/* User Profile Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          id="user-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          disablePortal
          PaperProps={{
            className: "shadow-lg mt-3 w-[220px] md:w-[260px] rounded-lg p-1 border border-border bg-popover text-popover-foreground",
            sx: {
              marginLeft: '-16px'
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* User Info Header Section */}
          <div className="flex items-center gap-3 px-4 py-2">
            <UiAvatar 
              name={user?.fullName || user?.username} 
              imgPath={user?.imagePath} 
              className="w-12 h-12 border-2 border-background shadow-sm flex-shrink-0 text-lg font-semibold" 
            />
            <div className="flex flex-col min-w-0">
              {user?.staffName && (
                <span className="font-semibold text-[15px] text-foreground truncate block leading-tight">
                  {user.staffName}
                </span>
              )}
              <span className="text-muted-foreground text-[12px] truncate mt-0.5 block">
                {user?.email || (user?.username ? `${user.username}@gmail.com` : 'user@domain.com')}
              </span>
              {user?.staffCode && (
                <span className="text-secondary text-[12px] font-semibold mt-0.5 block tracking-wide">
                  {user.staffCode}
                </span>
              )}
            </div>
          </div>
          <Divider className="my-1 border-border" />
          
          <MenuItem 
            onClick={handleClose}
            className="mx-1 my-0.5 px-3 py-2.5 rounded-md text-sm text-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground flex items-center gap-3 group transition-colors cursor-pointer"
          >
            <PersonOutlineIcon className="text-foreground group-hover:text-sidebar-accent-foreground w-[18px] h-[18px] min-w-[18px]" />
            Trang cá nhân
          </MenuItem>
          
          <MenuItem 
            onClick={handleClose}
            className="mx-1 my-0.5 px-3 py-2.5 rounded-md text-sm text-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground flex items-center gap-3 group transition-colors cursor-pointer"
          >
            <SettingsOutlinedIcon className="text-foreground group-hover:text-sidebar-accent-foreground w-[18px] h-[18px] min-w-[18px]" />
            Cài đặt
          </MenuItem>
          
          <MenuItem 
            onClick={handleLogoutClick} 
            className="mx-1 my-0.5 px-3 py-2.5 rounded-md text-sm text-destructive hover:bg-destructive/10 flex items-center gap-3 group transition-colors cursor-pointer"
          >
            <LogoutIcon className="text-destructive w-[18px] h-[18px] min-w-[18px]" />
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


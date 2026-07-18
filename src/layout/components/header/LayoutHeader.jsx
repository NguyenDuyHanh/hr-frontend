import React, { useState, useEffect, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  IconButton, Button, Menu, MenuItem, Divider, Typography, Box, 
  Chip, Tooltip
} from '@mui/material'
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import AppsIcon from '@mui/icons-material/Apps'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { toast } from 'sonner'

import useThemeStore from '@/store/themeStore'
import useSidebarStore from '@/store/sidebarStore'
import useAuthStore from '@/store/useAuthStore'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'
import Avatar from '@/components/ui/Avatar'
import NotificationBell from './NotificationBell'
import QuickTimekeeping from './QuickTimekeeping'

const LayoutHeader = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toggleCollapsed, toggleMobileOpen } = useSidebarStore();
  const { user, logout } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const currentLang = (i18n.language || 'vi').startsWith('vi') ? 'vi' : 'en';

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  // Quick Timekeeping Dialog State
  const [timekeepingOpen, setTimekeepingOpen] = useState(false);

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
        <NavLink to="/" className='bg-primary text-primary-foreground px-4 py-1 rounded-md font-bold text-[18px] tracking-widest no-underline hidden md:block shadow-sm hover:opacity-95'>
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
        {/* Nút Chấm công giống hr-v5 nhưng theo style hrm */}
        {user && (
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AccessTimeIcon />}
            onClick={() => {
              if (!user?.staffId) {
                toast.error(t("header.link_profile_error", "Tài khoản của bạn chưa được liên kết với hồ sơ nhân sự nào để chấm công!"));
                return;
              }
              setTimekeepingOpen(true);
            }}
          >
            <span className='hidden md:block'>{t("header.timekeeping", "Chấm công")}</span>
          </Button>
        )}

        {/* <div className='flex items-center bg-muted hover:bg-primary/10 dark:hover:bg-primary/20 text-primary px-2.5 py-1.5 rounded-md cursor-pointer border border-border'>
          <MailOutlineIcon sx={{ fontSize: '18px' }} />
        </div> */}
 
        <NotificationBell />
 
        {/* <div className='flex items-center bg-muted hover:bg-primary/10 dark:hover:bg-primary/20 text-primary px-2.5 py-1.5 rounded-md cursor-pointer border border-border'>
          <AppsIcon sx={{ fontSize: '18px' }} />
        </div> */}

        {/* Nút bật/tắt chế độ Sáng/Tối */}
        <Tooltip title={mode === 'light' ? t('header.toggle_dark', 'Chuyển sang chế độ tối') : t('header.toggle_light', 'Chuyển sang chế độ sáng')} arrow>
          <div 
            onClick={toggleTheme}
            className='flex items-center bg-background hover:bg-primary/10 dark:hover:bg-primary/20 text-primary px-2.5 py-1.5 rounded-md cursor-pointer border border-border'
          >
            {mode === 'light' ? <DarkModeIcon sx={{ fontSize: '18px' }} /> : <LightModeIcon sx={{ fontSize: '18px' }} />}
          </div>
        </Tooltip>

        {/* Nút chuyển đổi ngôn ngữ */}
        <Tooltip title={currentLang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'} arrow>
          <div 
            onClick={() => i18n.changeLanguage(currentLang === 'vi' ? 'en' : 'vi')}
            className='flex items-center justify-center bg-background hover:bg-primary/10 dark:hover:bg-primary/20 text-primary px-2.5 py-1.5 rounded-md cursor-pointer border border-border font-bold text-xs w-9 h-[32px] select-none active:scale-95'
          >
            {currentLang === 'vi' ? 'EN' : 'VI'}
          </div>
        </Tooltip>
 
        {/* Avatar Trigger */}
        <div 
          onClick={handleAvatarClick}
          className='w-8 h-8 rounded-full hover:opacity-90 active:scale-95 flex items-center justify-center border border-border cursor-pointer ml-2 shadow-sm overflow-hidden'
        >
          <Avatar 
            name={user?.fullName || user?.username} 
            imgPath={user?.avatarUrl} 
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
          <div className="flex items-center gap-3 px-4 py-2">
            <Avatar 
              name={user?.fullName || user?.username} 
              imgPath={user?.avatarUrl} 
              className="w-12 h-12 border-2 border-background shadow-sm flex-shrink-0 text-lg font-semibold" 
            />
            <div className="flex flex-col min-w-0">
              {user?.staffName && (
              <span className="font-semibold text-[15px] text-foreground truncate block leading-tight">
                  {user.staffName}
              </span>
              )}
              {user?.email && (
                <span className="text-muted-foreground text-[12px] truncate mt-0.5 block">
                  {user.email}
                </span>
              )}
              {user?.staffCode && (
                <span className="text-secondary text-[12px] font-semibold mt-0.5 block tracking-wide">
                  {user.staffCode}
                </span>
              )}
            </div>
          </div>
          <Divider className="my-1 border-border" />
          
          <MenuItem 
            onClick={() => {
              handleClose();
              navigate('/profile');
            }}
            className="mx-1 my-0.5 px-3 py-2.5 rounded-md text-sm text-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground flex items-center gap-3 group transition-colors cursor-pointer"
          >
            <PersonOutlineIcon className="text-foreground group-hover:text-sidebar-accent-foreground w-[18px] h-[18px] min-w-[18px]" />
            {t("header.profile", "Hồ sơ cá nhân")}
          </MenuItem>
          
          <MenuItem 
            onClick={handleClose}
            className="mx-1 my-0.5 px-3 py-2.5 rounded-md text-sm text-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground flex items-center gap-3 group transition-colors cursor-pointer"
          >
            <SettingsOutlinedIcon className="text-foreground group-hover:text-sidebar-accent-foreground w-[18px] h-[18px] min-w-[18px]" />
            {t("header.settings", "Cài đặt")}
          </MenuItem>
          
          <MenuItem 
            onClick={handleLogoutClick} 
            className="mx-1 my-0.5 px-3 py-2.5 rounded-md text-sm text-destructive hover:bg-destructive/10 flex items-center gap-3 group transition-colors cursor-pointer"
          >
            <LogoutIcon className="text-destructive w-[18px] h-[18px] min-w-[18px]" />
            {t("header.logout", "Đăng xuất")}
          </MenuItem>
        </Menu>
 
        {/* Confirmation Dialog for Logging out */}
        <ConfirmationDialog
          open={showConfirmLogout}
          onConfirmDialogClose={() => setShowConfirmLogout(false)}
          title={t("header.logout_confirm_title", "Xác nhận đăng xuất")}
          text={t("header.logout_confirm_text", "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?")}
          agree={t("header.logout", "Đăng xuất")}
          cancel={t("common.cancel", "Hủy")}
          onYesClick={handleConfirmLogout}
          container={document.getElementById('root')}
        />

        {/* Quick Timekeeping Dialog Component */}
        <QuickTimekeeping
          open={timekeepingOpen}
          onClose={() => setTimekeepingOpen(false)}
        />
      </div>
    </div>
  )
}

export default LayoutHeader


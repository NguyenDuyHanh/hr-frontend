import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  IconButton, Button, Menu, MenuItem, Divider, Tooltip
} from '@mui/material'
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'
import AppsIcon from '@mui/icons-material/Apps'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LanguageIcon from '@mui/icons-material/Language'
import { toast } from 'sonner'

import useThemeStore from '@/store/themeStore'
import useSidebarStore from '@/store/sidebarStore'
import useAuthStore from '@/store/useAuthStore'
import useMenuFilterStore from '@/store/useMenuFilterStore'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'
import Avatar from '@/components/ui/Avatar'
import NotificationBell from './NotificationBell'
import QuickTimekeeping from './QuickTimekeeping'
import AppSwitcherPopover from './AppSwitcherPopover'

const LayoutHeader = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toggleCollapsed, toggleMobileOpen } = useSidebarStore();
  const { user, logout } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const currentLang = (i18n.language || 'vi').startsWith('vi') ? 'vi' : 'en';

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [appSwitcherAnchorEl, setAppSwitcherAnchorEl] = useState(null);
  const appSwitcherOpen = Boolean(appSwitcherAnchorEl);
  const selectedSections = useMenuFilterStore((state) => state.selectedSections);
  const isFilterActive = selectedSections.length > 0;
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
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
    <div className="h-[48px] flex items-center justify-between px-4 bg-background text-foreground border-b border-border shadow-xs select-none z-50">
      {/* Left Side: Toggle Button */}
      <div className="flex items-center">
        <IconButton
          size="small"
          onClick={handleToggle}
          className="text-primary hover:bg-muted"
        >
          <MenuOutlinedIcon fontSize="medium" />
        </IconButton>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-3 text-sm">
        {/* Nút Chấm công */}
        {user && (
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AccessTimeIcon sx={{ fontSize: '16px' }} />}
            onClick={() => {
              if (!user?.staffId) {
                toast.error(t("header.link_profile_error", "Tài khoản của bạn chưa được liên kết với hồ sơ nhân sự nào để chấm công!"));
                return;
              }
              setTimekeepingOpen(true);
            }}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '13px' }}
          >
            <span className="hidden sm:inline">{t("header.timekeeping", "Chấm công")}</span>
          </Button>
        )}

        <div className="h-6 w-[1px] bg-primary/60 hidden sm:block"></div>

        {/* App Switcher Icon */}
        <Tooltip title={t("header.apps", "Chọn phân hệ")} arrow>
          <div 
            onClick={(e) => setAppSwitcherAnchorEl(e.currentTarget)}
            className="relative flex items-center justify-center bg-background hover:bg-muted text-primary w-8 h-8 rounded-xl cursor-pointer border border-border shadow-2xs"
          >
            <AppsIcon sx={{ fontSize: "18px" }} />
            {isFilterActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-background animate-pulse" />
            )}
          </div>
        </Tooltip>

        <AppSwitcherPopover
          anchorEl={appSwitcherAnchorEl}
          open={appSwitcherOpen}
          onClose={() => setAppSwitcherAnchorEl(null)}
        />

        {/* Language Selector */}
        <Tooltip title={currentLang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'} arrow>
          <div 
            onClick={() => i18n.changeLanguage(currentLang === 'vi' ? 'en' : 'vi')}
            className="flex items-center justify-center bg-background hover:bg-muted text-primary px-2.5 h-8 rounded-xl cursor-pointer border border-border font-bold text-xs select-none gap-1 shadow-2xs"
          >
            <LanguageIcon sx={{ fontSize: "15px" }} />
            <span>{currentLang.toUpperCase()}</span>
          </div>
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip title={mode === 'light' ? t('header.toggle_dark', 'Chuyển sang chế độ tối') : t('header.toggle_light', 'Chuyển sang chế độ sáng')} arrow>
          <div 
            onClick={toggleTheme}
            className="flex items-center justify-center bg-background hover:bg-muted text-primary w-8 h-8 rounded-xl cursor-pointer border border-border shadow-2xs"
          >
            {mode === 'light' ? <DarkModeIcon sx={{ fontSize: '18px' }} /> : <LightModeIcon sx={{ fontSize: '18px' }} />}
          </div>
        </Tooltip>


        {/* Notification Bell */}
        <NotificationBell />

        <div className="h-6 w-[1px] bg-primary/60"></div>

        {/* User Profile Avatar & Info */}
        <div
          onClick={handleAvatarClick}
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted cursor-pointer transition-colors"
        >
          <Avatar 
            name={user?.fullName || user?.username} 
            imgPath={user?.avatarUrl} 
            className="w-8 h-8 border border-border shadow-xs flex-shrink-0 text-xs font-bold" 
          />
          <div className="hidden md:flex flex-col text-left leading-tight">
            <span className="font-semibold text-[14px] text-foreground truncate max-w-[140px]">
              {user?.fullName || user?.username}
            </span>
            <span className="text-[12px] text-muted-foreground truncate font-medium">
              {user?.staffName || user?.role?.[0] || 'admin'}
            </span>
          </div>
        </div>
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
          className: "shadow-xl mt-2 w-[230px] rounded-lg p-1 border border-border bg-popover text-popover-foreground",
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar 
            name={user?.fullName || user?.username} 
            imgPath={user?.avatarUrl} 
            className="w-10 h-10 border-2 border-background shadow-xs flex-shrink-0 text-sm font-semibold" 
          />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-[14px] text-foreground truncate block leading-tight">
              {user?.fullName || user?.username}
            </span>
            {user?.email && (
              <span className="text-muted-foreground text-[12px] truncate mt-0.5 block">
                {user.email}
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
          className="mx-1 my-0.5 px-3 py-2 rounded-md text-[14px] font-medium text-foreground hover:bg-sidebar-accent/40 flex items-center gap-3 cursor-pointer"
        >
          <PersonOutlineIcon className="w-[18px] h-[18px]" />
          {t("header.profile", "Hồ sơ cá nhân")}
        </MenuItem>
        
        <MenuItem 
          onClick={handleClose}
          className="mx-1 my-0.5 px-3 py-2 rounded-md text-[14px] font-medium text-foreground hover:bg-sidebar-accent/40 flex items-center gap-3 cursor-pointer"
        >
          <SettingsOutlinedIcon className="w-[18px] h-[18px]" />
          {t("header.settings", "Cài đặt")}
        </MenuItem>
        
        <MenuItem 
          onClick={handleLogoutClick} 
          className="mx-1 my-0.5 px-3 py-2 rounded-md text-[14px] font-medium text-destructive hover:bg-destructive/10 flex items-center gap-3 cursor-pointer"
        >
          <LogoutIcon className="w-[18px] h-[18px]" />
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
  )
}

export default LayoutHeader

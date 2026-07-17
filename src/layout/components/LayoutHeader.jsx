import React, { useState, useEffect, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  IconButton, Button, Menu, MenuItem, Divider, Typography, Box, 
  Chip, Tooltip
} from '@mui/material'
import { useFormik, FormikProvider } from 'formik'
import TextField from '@/components/ui/TextField'
import SelectInput from '@/components/ui/SelectInput'
import DateTimePicker from '@/components/ui/DateTimePicker'
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
import CloseIcon from '@mui/icons-material/Close'
import InfoIcon from '@mui/icons-material/Info'
import WifiIcon from '@mui/icons-material/Wifi'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import dayjs from 'dayjs'
import { toast } from 'sonner'

import useThemeStore from '@/store/themeStore'
import useSidebarStore from '@/store/sidebarStore'
import useAuthStore from '@/store/useAuthStore'
import useTimesheetStore from '@/store/useTimesheetStore'
import useShiftWorkStore from '@/store/useShiftWorkStore'
import { uploadImage } from '@/services/CloudinaryService'
import { getTimesheetByStaffAndRange } from '@/services/timesheetService'
import WebcamCapture from '@/pages/Timekeeping/components/WebcamCapture'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'
import Avatar from '@/components/ui/Avatar'
import Popup from '@/components/ui/Popup'
import PagingAutocomplete from '@/components/ui/PagingAutocomplete'
import { pagingStaffs } from '@/services/StaffService'

const LayoutHeader = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toggleCollapsed, toggleMobileOpen } = useSidebarStore();
  const { user, logout } = useAuthStore();
  const hasRole = useAuthStore(state => state.hasRole);
  const isManagerOrAdmin = hasRole(['ROLE_ADMIN', 'HR_MANAGER', 'HR_TIMEKEEPING_MANAGER']);
  const { mode, toggleTheme } = useThemeStore();
  const currentLang = (i18n.language || 'vi').startsWith('vi') ? 'vi' : 'en';
  const { checkInOut, loadMyTimesheets } = useTimesheetStore();
  const { allShifts, loadAllShifts } = useShiftWorkStore();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  // Quick Timekeeping Dialog States
  const [timekeepingOpen, setTimekeepingOpen] = useState(false);
  const [time, setTime] = useState(dayjs());
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [ipAddress, setIpAddress] = useState('Fetching...');
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmTimekeeping, setShowConfirmTimekeeping] = useState(false);
  const [todayTimesheet, setTodayTimesheet] = useState(null);
  const [modalOpenedAt, setModalOpenedAt] = useState(null);

  useEffect(() => {
    if (timekeepingOpen) {
      setModalOpenedAt(new Date());
    } else {
      setModalOpenedAt(null);
    }
  }, [timekeepingOpen]);

  // GPS coordinates and client IP
  useEffect(() => {
    if (timekeepingOpen) {
      setTime(dayjs());
      fetchIp();
      fetchLocation();
      loadAllShifts();
    }
  }, [timekeepingOpen, loadAllShifts]);

  // Fetch client IP
  const fetchIp = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      setIpAddress(data.ip);
    } catch (err) {
      console.error('Failed to get IP address:', err);
      setIpAddress('127.0.0.1');
    }
  };

  // Fetch GPS Coordinates
  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.warn('Geolocation warning: ', err.message);
          setLocation({
            lat: null,
            lng: null
          });
        }
      );
    }
  };

  const defaultShiftId = useMemo(() => {
    if (allShifts.length > 0) {
      const defaultShift = allShifts.find(s => s.code?.toLowerCase().includes('hanh_chinh') || s.code?.toLowerCase().includes('ca_ngay')) || allShifts[0];
      return defaultShift?.id || '';
    }
    return '';
  }, [allShifts]);

  const shiftOptions = useMemo(() => {
    return allShifts.map(shift => ({
      value: shift.id,
      name: `${shift.name} (${shift.startTime} - ${shift.endTime})`
    }));
  }, [allShifts]);

  const initialValues = useMemo(() => ({
    shiftId: defaultShiftId,
    recordType: 'CHECK_IN',
    staff: user?.staffId ? { id: user.staffId, displayName: user.staffName || user.fullName || user.username || '' } : null,
    staffName: user?.staffName || user?.fullName || user?.username || '',
    recordTime: modalOpenedAt
  }), [defaultShiftId, user?.staffId, user?.staffName, user?.fullName, user?.username, modalOpenedAt]);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const selectedStaffId = values.staff?.id || user?.staffId;
      if (!selectedStaffId) {
        toast.error("Không tìm thấy thông tin nhân viên");
        return;
      }

      if (!location.lat || !location.lng) {
        toast.error("Không thể chấm công khi chưa bật hoặc cấp quyền định vị GPS!");
        return;
      }

      if (!capturedPhoto) {
        toast.error("Chấm công bắt buộc phải chụp ảnh webcam minh chứng!");
        return;
      }

      setSubmitting(true);
      toast.info("Đang xử lý chấm công...");

      try {
        let uploadedPhotoUrl = "";
        if (capturedPhoto) {
          uploadedPhotoUrl = await uploadImage(capturedPhoto);
        }

        const checkInOutDto = {
          staffId: selectedStaffId,
          recordTime: dayjs(values.recordTime).second(0).millisecond(0).format('YYYY-MM-DDTHH:mm:ss'),
          ipAddress: ipAddress,
          latitude: location.lat,
          longitude: location.lng,
          deviceType: 'Web Browser',
          photoUrl: uploadedPhotoUrl || null,
          recordType: values.recordType,
          shiftId: values.shiftId || null
        };

        await checkInOut(checkInOutDto);
        toast.success(`Chấm công ${values.recordType === 'CHECK_IN' ? 'Vào ca' : 'Ra ca'} thành công!`);
        
        // Reload current month timesheets to immediately update the calendar view if open
        if (selectedStaffId) {
          const startOfMonth = dayjs(values.recordTime).startOf('month').format('YYYY-MM-DD');
          const endOfMonth = dayjs(values.recordTime).endOf('month').format('YYYY-MM-DD');
          loadMyTimesheets(selectedStaffId, startOfMonth, endOfMonth).catch(err => 
            console.error("Failed to refresh monthly timesheets after check-in/out:", err)
          );
        }
        
        // Reset states
        setTimekeepingOpen(false);
        setCapturedPhoto(null);
        setCameraActive(false);
        setTodayTimesheet(null);
      } catch (err) {
        console.error('Quick check in out submit error:', err);
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi chấm công');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const { values, setFieldValue } = formik;

  const selectedDateStr = useMemo(() => {
    return values.recordTime ? dayjs(values.recordTime).format('YYYY-MM-DD') : '';
  }, [values.recordTime]);

  const currentStaffId = values.staff?.id || user?.staffId;

  // Fetch selected date timesheet status when modal opens or selectedDateStr changes
  useEffect(() => {
    if (timekeepingOpen && currentStaffId && selectedDateStr) {
      getTimesheetByStaffAndRange(currentStaffId, selectedDateStr, selectedDateStr)
        .then(res => {
          if (res && res.data && res.data.length > 0) {
            setTodayTimesheet(res.data[0]);
          } else {
            setTodayTimesheet(null);
          }
        })
        .catch(err => {
          console.error('Failed to load selected date timesheet:', err);
          setTodayTimesheet(null);
        });
    } else {
      setTodayTimesheet(null);
    }
  }, [timekeepingOpen, currentStaffId, selectedDateStr]);

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

  // handleCheckInOutSubmit logic refactored into formik onSubmit

  const handleCloseTimekeepingDialog = () => {
    setTimekeepingOpen(false);
    setCapturedPhoto(null);
    setCameraActive(false);
    setTodayTimesheet(null);
    formik.resetForm();
  };

  const selectedShiftApprovedOrRejected = useMemo(() => {
    if (!todayTimesheet) return false;
    const status = todayTimesheet.status;
    return status === 'APPROVED' || status === 'REJECTED';
  }, [todayTimesheet]);

  const confirmationText = useMemo(() => {
    const actionText = values.recordType === 'CHECK_IN' ? 'Vào ca' : 'Ra ca';
    const dateStr = values.recordTime ? dayjs(values.recordTime).format('DD/MM/YYYY') : '';
    const shift = allShifts.find(s => s.id === values.shiftId);
    
    const formatTime = (timeStr) => {
      if (!timeStr) return '';
      return timeStr.substring(0, 5);
    };
    const shiftText = shift 
      ? ` cho ca ${shift.name} (${formatTime(shift.startTime)} - ${formatTime(shift.endTime)})` 
      : '';
    
    // If it's a CHECK_IN, we don't warn about updating/resubmitting since backend always takes the earliest check-in anyway.
    if (values.recordType === 'CHECK_IN') {
      return `Bạn có chắc chắn muốn thực hiện chấm công ${actionText}${shiftText} ngày ${dateStr} không?`;
    }

    // If it's a CHECK_OUT, we warn if todayTimesheet exists and has a special status
    if (todayTimesheet) {
      const status = todayTimesheet.status;
      if (status === 'APPROVED' || status === 'REJECTED') {
        return `Công ngày ${dateStr} của bạn đang ở trạng thái ${status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'TỪ CHỐI'}. Việc quẹt ${actionText}${shiftText} sẽ cập nhật lại dữ liệu giờ ra của ngày hôm đó. Bạn có chắc chắn muốn tiếp tục không?`;
      }
    }
    
    return `Bạn có chắc chắn muốn thực hiện chấm công ${actionText}${shiftText} ngày ${dateStr} không?`;
  }, [todayTimesheet, values.recordType, values.recordTime, values.shiftId, allShifts]);

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
        </div>
 
        <div className='flex items-center bg-muted hover:bg-primary/10 dark:hover:bg-primary/20 text-primary px-2.5 py-1.5 rounded-md cursor-pointer relative border border-border'>
          <NotificationsNoneIcon sx={{ fontSize: '18px' }} />
          <span className='absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-background'></span>
        </div> */}
 
        {/* <div className='flex items-center bg-muted hover:bg-primary/10 dark:hover:bg-primary/20 text-primary px-2.5 py-1.5 rounded-md cursor-pointer border border-border'>
          <AppsIcon sx={{ fontSize: '18px' }} />
        </div> */}

        {/* Nút bật/tắt chế độ Sáng/Tối */}
        <Tooltip title={mode === 'light' ? t('header.toggle_dark', 'Chuyển sang chế độ tối') : t('header.toggle_light', 'Chuyển sang chế độ sáng')} arrow>
          <div 
            onClick={toggleTheme}
            className='flex items-center bg-muted hover:bg-primary/10 dark:hover:bg-primary/20 text-primary px-2.5 py-1.5 rounded-md cursor-pointer border border-border'
          >
            {mode === 'light' ? <DarkModeIcon sx={{ fontSize: '18px' }} /> : <LightModeIcon sx={{ fontSize: '18px' }} />}
          </div>
        </Tooltip>

        {/* Nút chuyển đổi ngôn ngữ */}
        <Tooltip title={currentLang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'} arrow>
          <div 
            onClick={() => i18n.changeLanguage(currentLang === 'vi' ? 'en' : 'vi')}
            className='flex items-center justify-center bg-muted hover:bg-primary/10 dark:hover:bg-primary/20 text-primary px-2.5 py-1.5 rounded-md cursor-pointer border border-border font-bold text-xs w-9 h-[32px] select-none active:scale-95'
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

        {/* Confirmation Dialog for Timekeeping */}
        <ConfirmationDialog
          open={showConfirmTimekeeping}
          onConfirmDialogClose={() => setShowConfirmTimekeeping(false)}
          title={t("header.timekeeping_confirm_title", "Xác nhận chấm công")}
          text={confirmationText}
          agree={t("common.confirm", "Xác nhận")}
          cancel={t("common.cancel", "Hủy")}
          onYesClick={() => {
            setShowConfirmTimekeeping(false);
            formik.handleSubmit();
          }}
          container={document.getElementById('root')}
        />

        {/* Quick Timekeeping Dialog using shared Popup component */}
          <Popup
            open={timekeepingOpen}
            onClosePopup={handleCloseTimekeepingDialog}
            title="Chấm công"
            size="xs"
            action={
              <>
                <Button
                  onClick={handleCloseTimekeepingDialog}
                  variant="outlined"
                  color="inherit"
                  className="text-gray-600 hover:bg-gray-150 font-semibold normal-case px-4 py-1.5 rounded-lg"
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={submitting || selectedShiftApprovedOrRejected}
                  onClick={() => {
                    if (!location.lat || !location.lng) {
                      toast.error("Không thể chấm công khi chưa bật hoặc cấp quyền định vị GPS!");
                      return;
                    }
                    if (!capturedPhoto) {
                      toast.error("Chấm công bắt buộc phải chụp ảnh webcam minh chứng!");
                      return;
                    }
                    setShowConfirmTimekeeping(true);
                  }}
                  startIcon={<AccessTimeIcon />}
                  className="font-bold px-5 py-1.5 rounded-lg shadow-sm"
                >
                  Chấm công
                </Button>
              </>
            }
          >
            <FormikProvider value={formik}>
              <Box className="space-y-4 pt-[-6px] pb-2">
                {selectedShiftApprovedOrRejected && (
                  <Box className="bg-red-50 dark:bg-red-950/20 p-3.5 rounded-xl border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-400 flex items-start gap-2.5">
                    <InfoIcon sx={{ fontSize: 16, color: 'error.main', mt: 0.5 }} />
                    <Box className="font-semibold leading-relaxed">
                      Ngày công này đã được phê duyệt hoặc từ chối, không thể tiếp tục chấm công.
                    </Box>
                  </Box>
                )}

                {/* Requirement Verification Box */}
                <Box className="bg-muted p-3.5 rounded-xl border border-border text-xs space-y-2.5">
                  <Box className="flex items-center gap-2 text-muted-foreground font-medium">
                    <InfoIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    <span>Yêu cầu xác minh:</span>
                  </Box>
                  <Box className="flex gap-3 pl-6">
                    <Chip 
                      icon={<WifiIcon style={{ color: 'inherit', fontSize: 13 }} />} 
                      label="IP hoặc GPS" 
                      size="small" 
                      color="primary"
                      variant="outlined"
                      className="text-[10px] font-bold h-[22px] px-1.5 rounded-md" 
                    />
                    <Chip 
                      icon={<CameraAltIcon style={{ color: 'inherit', fontSize: 13 }} />} 
                      label="Ảnh minh chứng" 
                      size="small" 
                      color="primary"
                      variant="outlined"
                      className="text-[10px] font-bold h-[22px] px-1.5 rounded-md" 
                    />
                  </Box>
                </Box>

                {/* GPS Coordinates panel */}
                <Box className="space-y-1.5">
                  <Typography variant="caption" className="font-bold text-primary tracking-wider uppercase">
                    TỌA ĐỘ CHẤM CÔNG
                  </Typography>
                  <Box className="flex items-center gap-2 bg-muted px-3.5 py-2.5 rounded-lg border border-border text-xs text-foreground">
                    <LocationOnIcon className="text-primary" sx={{ fontSize: 16 }} />
                    <Box className="flex justify-between w-full font-semibold">
                      <span className="text-muted-foreground">Vĩ độ: <span className="text-muted-foreground">{location.lat ? location.lat.toFixed(14) : 'Chưa cấp quyền GPS'}</span></span>
                      <span className="text-muted-foreground">Kinh độ: <span className="text-muted-foreground">{location.lng ? location.lng.toFixed(14) : 'Chưa cấp quyền GPS'}</span></span>
                    </Box>
                  </Box>
                </Box>

                {/* Evidence Image Capture */}
                <Box className="space-y-1.5">
                  <Typography variant="caption" className="font-bold text-primary tracking-wider uppercase">
                    HÌNH ẢNH MINH CHỨNG
                  </Typography>

                  {!cameraActive && !capturedPhoto ? (
                    <Box className="flex justify-center py-2">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setCameraActive(true)}
                        startIcon={<CameraAltIcon />}
                        className="font-bold rounded-lg px-6 py-2 normal-case shadow-sm"
                      >
                        Chụp ảnh chấm công
                      </Button>
                    </Box>
                  ) : (
                    <Box className="w-full rounded-xl overflow-hidden">
                      <WebcamCapture 
                        onCapture={(photo) => {
                          setCapturedPhoto(photo);
                          if (photo) {
                            setCameraActive(false);
                          }
                        }} 
                        initialImage={capturedPhoto}
                      />
                    </Box>
                  )}
                </Box>

                {/* Timekeeping Info Form */}
                <Box className="space-y-3 pt-2">
                  <Typography variant="caption" className="font-bold text-primary tracking-wider uppercase">
                    THÔNG TIN CHẤM CÔNG
                  </Typography>
                  
                  <SelectInput
                    label="Ca làm việc"
                    name="shiftId"
                    options={shiftOptions}
                    required
                    fullWidth
                    hideNullOption
                  />

                  {/* Segmented control for Check-in / Check-out with standard HRM style */}
                  <Box className="space-y-1 mb-4">
                    <Typography variant="caption" className="block text-sm font-semibold mb-1.5 text-muted-foreground">
                      Hình thức chấm công <span style={{ color: 'red' }} className="font-bold ml-1">*</span>
                    </Typography>
                    <Box className="flex bg-muted p-1 rounded-xl w-full border border-border">
                      <button
                        type="button"
                        onClick={() => setFieldValue('recordType', 'CHECK_IN')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition duration-150 ${
                          values.recordType === 'CHECK_IN' 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Vào ca (CHECK IN)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFieldValue('recordType', 'CHECK_OUT')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition duration-150 ${
                          values.recordType === 'CHECK_OUT' 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Ra ca (CHECK OUT)
                      </button>
                    </Box>
                  </Box>

                  {isManagerOrAdmin ? (
                    <PagingAutocomplete 
                      label="Nhân viên chấm công" 
                      name="staff"
                      api={pagingStaffs}
                      getOptionLabel={(option) => {
                        if (!option) return "";
                        const codePart = option.staffCode ? ` (${option.staffCode})` : "";
                        return `${option.displayName || option.staffName || ''}${codePart}`;
                      }}
                      onChange={(event, value) => {
                        setFieldValue('staff', value);
                        setFieldValue('staffName', value?.displayName || value?.staffName || '');
                      }}
                    />
                  ) : (
                    <TextField
                      label="Nhân viên chấm công"
                      name="staffName"
                      disabled
                      readOnly
                      fullWidth
                    />
                  )}

                  <DateTimePicker
                    label="Ngày làm việc"
                    name="recordTime"
                    isDateTimePicker
                    notValueMillisecond={true}
                    required
                    fullWidth
                  />
                </Box>
              </Box>
            </FormikProvider>
          </Popup>
      </div>
    </div>
  )
}

export default LayoutHeader


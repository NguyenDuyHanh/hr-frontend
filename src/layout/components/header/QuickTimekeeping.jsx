import React, { useState, useEffect, useMemo } from 'react';
import { Button, Box, Typography, Chip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import WifiIcon from '@mui/icons-material/Wifi';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useFormik, FormikProvider } from 'formik';
import { useTranslation } from 'react-i18next';

import TextField from '@/components/ui/TextField';
import SelectInput from '@/components/ui/SelectInput';
import DateTimePicker from '@/components/ui/DateTimePicker';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import Popup from '@/components/ui/Popup';
import PagingAutocomplete from '@/components/ui/PagingAutocomplete';
import WebcamCapture from '@/pages/Timekeeping/components/WebcamCapture';

import useAuthStore from '@/store/useAuthStore';
import useTimesheetStore from '@/store/useTimesheetStore';
import useShiftWorkStore from '@/store/useShiftWorkStore';
import { uploadImage } from '@/services/CloudinaryService';
import { getTimesheetByStaffAndRange } from '@/services/timesheetService';
import { pagingStaffs } from '@/services/StaffService';

const QuickTimekeeping = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const hasRole = useAuthStore((state) => state.hasRole);
  const isManagerOrAdmin = hasRole(['ROLE_ADMIN', 'HR_MANAGER', 'HR_TIMEKEEPING_MANAGER']);
  const { checkInOut, loadMyTimesheets } = useTimesheetStore();
  const { allShifts, loadAllShifts } = useShiftWorkStore();

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
    if (open) {
      setModalOpenedAt(new Date());
    } else {
      setModalOpenedAt(null);
    }
  }, [open]);

  // GPS coordinates and client IP
  useEffect(() => {
    if (open) {
      setTime(dayjs());
      fetchIp();
      fetchLocation();
      loadAllShifts();
    }
  }, [open, loadAllShifts]);

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
          setLocation({ lat: null, lng: null });
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
        
        if (selectedStaffId) {
          const startOfMonth = dayjs(values.recordTime).startOf('month').format('YYYY-MM-DD');
          const endOfMonth = dayjs(values.recordTime).endOf('month').format('YYYY-MM-DD');
          loadMyTimesheets(selectedStaffId, startOfMonth, endOfMonth).catch(err => 
            console.error("Failed to refresh monthly timesheets after check-in/out:", err)
          );
        }
        
        handleClose();
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
    if (open && currentStaffId && selectedDateStr) {
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
  }, [open, currentStaffId, selectedDateStr]);

  const handleClose = () => {
    setCapturedPhoto(null);
    setCameraActive(false);
    setTodayTimesheet(null);
    formik.resetForm();
    onClose();
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
    
    if (values.recordType === 'CHECK_IN') {
      return `Bạn có chắc chắn muốn thực hiện chấm công ${actionText}${shiftText} ngày ${dateStr} không?`;
    }

    if (todayTimesheet) {
      const status = todayTimesheet.status;
      if (status === 'APPROVED' || status === 'REJECTED') {
        return `Công ngày ${dateStr} của bạn đang ở trạng thái ${status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'TỪ CHỐI'}. Việc quẹt ${actionText}${shiftText} sẽ cập nhật lại dữ liệu giờ ra của ngày hôm đó. Bạn có chắc chắn muốn tiếp tục không?`;
      }
    }
    
    return `Bạn có chắc chắn muốn thực hiện chấm công ${actionText}${shiftText} ngày ${dateStr} không?`;
  }, [todayTimesheet, values.recordType, values.recordTime, values.shiftId, allShifts]);

  return (
    <>
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

      <Popup
        open={open}
        onClosePopup={handleClose}
        title="Chấm công"
        size="xs"
        action={
          <>
            <Button
              onClick={handleClose}
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
    </>
  );
};

export default QuickTimekeeping;

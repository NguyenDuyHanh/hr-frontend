import React, { useEffect, useMemo, useState } from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Grid, Button, FormControlLabel, Checkbox } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import useAuthStore from '../../../store/useAuthStore';
import TextField from '../../../components/ui/TextField';
import SelectInput from '../../../components/ui/SelectInput';
import DateTimePicker from '../../../components/ui/DateTimePicker';
import AsyncAutocomplete from '../../../components/ui/AsyncAutocomplete';
import Popup from '../../../components/ui/Popup';
import { pagingStaffs } from '../../../services/StaffService';
import { getAllShifts } from '../../../services/shiftWorkService';
import { useAddLeaveRequest, useModifyLeaveRequest } from '../api';

const LeaveRequestForm = ({ open, onClose, requestData, onSaveSuccess }) => {
    const { t } = useTranslation();
    const addMutation = useAddLeaveRequest();
    const modifyMutation = useModifyLeaveRequest();

    const { hasRole, user } = useAuthStore();
    const [shifts, setShifts] = useState([]);

    const isAdminOrHR = hasRole(['ROLE_ADMIN', 'HR_MANAGER']);

    useEffect(() => {
        const fetchShifts = async () => {
            try {
                const response = await getAllShifts();
                const shiftList = response?.data || response || [];
                setShifts(shiftList.filter(s => s.code === 'CA_SANG' || s.code === 'CA_CHIEU'));
            } catch (error) {
                console.error("Failed to fetch shifts", error);
            }
        };
        fetchShifts();
    }, []);

    const initialValues = useMemo(() => ({
        id: requestData?.id || null,
        requestStaff: requestData?.requestStaffId ? {
            id: requestData.requestStaffId,
            displayName: requestData.requestStaffName,
            staffCode: requestData.requestStaffCode
        } : (user?.staffId ? {
            id: user.staffId,
            displayName: user.staffName || user.username || '',
            staffCode: user.staffCode || ''
        } : null),
        leaveType: requestData?.leaveType || 'ANNUAL',
        fromDate: requestData?.fromDate ? new Date(requestData.fromDate) : new Date(),
        toDate: requestData?.toDate ? new Date(requestData.toDate) : new Date(),
        requestReason: requestData?.requestReason || '',
        halfDayLeave: requestData?.halfDayLeave ?? false,
        shiftWorkId: requestData?.shiftWorkId || '',
    }), [requestData, user, isAdminOrHR]);

    const validationSchema = Yup.object({
        requestStaff: Yup.object().nullable().required(t('leave.validation.staffRequired', 'Nhân viên là bắt buộc')),
        leaveType: Yup.string().required(t('leave.validation.typeRequired', 'Loại phép là bắt buộc')),
        fromDate: Yup.date().required(t('leave.validation.fromDateRequired', 'Ngày bắt đầu là bắt buộc')),
        toDate: Yup.date().required(t('leave.validation.toDateRequired', 'Ngày kết thúc là bắt buộc'))
            .min(Yup.ref('fromDate'), t('leave.validation.dateOrder', 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu')),
    });

    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                const submitValues = {
                    id: values.id,
                    requestStaffId: values.requestStaff?.id,
                    leaveType: values.leaveType,
                    fromDate: format(new Date(values.fromDate), 'yyyy-MM-dd'),
                    toDate: format(new Date(values.toDate), 'yyyy-MM-dd'),
                    requestReason: values.requestReason,
                    halfDayLeave: values.halfDayLeave,
                    shiftWorkId: values.shiftWorkId || null,
                };

                if (values.id) {
                    await modifyMutation.mutateAsync(submitValues);
                } else {
                    await addMutation.mutateAsync(submitValues);
                }
                onClose();
                if (onSaveSuccess) onSaveSuccess();
            } catch (error) {
                console.error(error);
            }
        },
    });

    const isSingleDay = useMemo(() => {
        if (!formik.values.fromDate || !formik.values.toDate) return true;
        const d1 = format(new Date(formik.values.fromDate), 'yyyy-MM-dd');
        const d2 = format(new Date(formik.values.toDate), 'yyyy-MM-dd');
        return d1 === d2;
    }, [formik.values.fromDate, formik.values.toDate]);

    useEffect(() => {
        if (!isSingleDay) {
            formik.setFieldValue('halfDayLeave', false);
            formik.setFieldValue('shiftWorkId', '');
        }
    }, [isSingleDay]);

    const action = (
        <>
            <Button onClick={onClose} variant="outlined" color="inherit" sx={{ color: 'text.secondary', textTransform: 'none' }}>
                {t('general.cancel', 'Hủy bỏ')}
            </Button>
            <Button 
                onClick={formik.handleSubmit} 
                color="primary" 
                variant="contained" 
                sx={{ textTransform: 'none', px: 4, ml: 1 }}
                disabled={addMutation.isPending || modifyMutation.isPending}
            >
                {t('general.save', 'Lưu lại')}
            </Button>
        </>
    );

    const leaveTypeOptions = [
        { value: 'ANNUAL', name: t('leave.type.annual', 'Phép năm') },
        { value: 'UNPAID', name: t('leave.type.unpaid', 'Phép không lương') }
    ];

    return (
        <Popup
            open={open}
            onClosePopup={onClose}
            title={requestData ? t('leave.title.edit', 'Chỉnh sửa đơn nghỉ phép') : t('leave.title.create', 'Thêm mới đơn nghỉ phép')}
            size="md"
            action={action}
        >
            <FormikProvider value={formik}>
                <Grid container spacing={2} className='pt-3 pb-0'>

                    {/* Lựa chọn nhân viên (chỉ hiển thị cho HR/Admin khi tạo mới hoặc sửa) */}
                    {isAdminOrHR ? (
                        <Grid item xs={12} sm={6}>
                            <AsyncAutocomplete
                                name="requestStaff"
                                label={t('leave.field.staff', 'Nhân viên')}
                                api={pagingStaffs}
                                searchObject={{ pageIndex: 1, pageSize: 50 }}
                                displayName="displayName"
                                formik={formik}
                                required
                            />
                        </Grid>
                    ) : (
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label={t('leave.field.staff', 'Nhân viên')}
                                name="requestStaff.displayName"
                                value={user?.staffName || user?.username || ''}
                                disabled
                            />
                        </Grid>
                    )}

                    {/* Loại nghỉ phép */}
                    <Grid item xs={12} sm={6}>
                        <SelectInput
                            name="leaveType"
                            label={t('leave.field.leaveType', 'Loại nghỉ phép')}
                            options={leaveTypeOptions}
                            keyValue="value"
                            displayvalue="name"
                            hideNullOption={true}
                            required
                        />
                    </Grid>

                    {/* Thời gian */}
                    <Grid item xs={12} sm={6}>
                        <DateTimePicker
                            label={t('leave.field.fromDate', 'Từ ngày')}
                            name="fromDate"
                            notValueMillisecond={true}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DateTimePicker
                            label={t('leave.field.toDate', 'Đến ngày')}
                            name="toDate"
                            notValueMillisecond={true}
                            required
                        />
                    </Grid>

                    {/* Checkbox nghỉ nửa ngày */}
                    {isSingleDay && (
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formik.values.halfDayLeave}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            formik.setFieldValue('halfDayLeave', checked);
                                            if (!checked) {
                                                formik.setFieldValue('shiftWorkId', '');
                                            } else {
                                                // Mặc định chọn ca đầu tiên cho nửa ngày
                                                if (shifts.length > 0) {
                                                    formik.setFieldValue('shiftWorkId', shifts[0].id);
                                                }
                                            }
                                        }}
                                    />
                                }
                                label={t('leave.field.halfDayLeave', 'Nghỉ nửa ngày')}
                            />
                        </Grid>
                    )}

                    {/* Các cấu hình chi tiết cho nghỉ nửa ngày */}
                    {formik.values.halfDayLeave && (
                        <Grid item xs={12} sm={6}>
                            <SelectInput
                                name="shiftWorkId"
                                label={t('leave.field.shiftOff', 'Ca nghỉ phép')}
                                options={shifts}
                                keyValue="id"
                                displayvalue="name"
                            />
                        </Grid>
                    )}

                    {/* Lý do nghỉ */}
                    <Grid item xs={12}>
                        <TextField
                            label={t('leave.field.reason', 'Lý do nghỉ phép')}
                            name="requestReason"
                            multiline
                            rows={3}
                        />
                    </Grid>
                </Grid>
            </FormikProvider>
        </Popup>
    );
};

export default LeaveRequestForm;

import React, { useMemo, useEffect } from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Box, Button } from '@mui/material';
import { useAddStaff, useModifyStaff, useStaffCode } from '../api';
import TextField from '../../../components/ui/TextField';
import SelectInput from '../../../components/ui/SelectInput';
import DateTimePicker from '../../../components/ui/DateTimePicker';
import Popup from '../../../components/ui/Popup';
import { WorkingStatusOptions } from '../../../constants';
import { format } from 'date-fns';

const StaffForm = ({ open, onClose, staffData, onSaveSuccess }) => {
    const addStaffMutation = useAddStaff();
    const modifyStaffMutation = useModifyStaff();
    const { data: generatedCode } = useStaffCode(open, staffData);

    const initialValues = useMemo(() => ({
        id: staffData?.id || null,
        staffCode: staffData?.staffCode || '',
        displayName: staffData?.displayName || '',
        email: staffData?.email || '',
        startDate: staffData?.startDate ? new Date(staffData.startDate) : new Date(),
        workingStatus: staffData?.workingStatus || '',
    }), [staffData]);

    const validationSchema = Yup.object({
        staffCode: Yup.string().required('Mã nhân viên là bắt buộc'),
        displayName: Yup.string().required('Họ và tên là bắt buộc'),
        email: Yup.string().trim().email('Email không đúng định dạng').required('Email là bắt buộc'),
        workingStatus: Yup.mixed().required('Trạng thái là bắt buộc'),
    });

    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: async (values, { setErrors }) => {
            // Format date to YYYY-MM-DD before sending to backend
            const submitValues = { ...values };
            if (values.startDate) {
                submitValues.startDate = format(new Date(values.startDate), 'yyyy-MM-dd');
            }

            try {
                if (values.id) {
                    await modifyStaffMutation.mutateAsync(submitValues);
                } else {
                    await addStaffMutation.mutateAsync(submitValues);
                }
                if (onSaveSuccess) onSaveSuccess();
                onClose();
            } catch (error) {
                if (error?.response?.data?.message?.includes('Email')) {
                    setErrors({ email: 'Email đã tồn tại trong hệ thống' });
                }
            }
        },
    });
    
    useEffect(() => {
        if (open && !staffData && generatedCode) {
            formik.setFieldValue('staffCode', generatedCode);
        }
    }, [open, staffData, generatedCode]);

    const action = (
        <>
            <Button onClick={onClose} variant="outlined" color="inherit" sx={{ color: 'text.secondary', textTransform: 'none' }}>Hủy bỏ</Button>
            <Button onClick={formik.handleSubmit} color="primary" variant="contained" sx={{ textTransform: 'none', px: 4, ml: 1 }}>Lưu lại</Button>
        </>
    );

    return (
        <Popup 
            open={open} 
            onClosePopup={onClose} 
            title={staffData ? 'Chỉnh sửa nhân viên' : 'Thêm mới nhân viên'}
            size="sm"
            action={action}
        >
            <FormikProvider value={formik}>
                <Box>
                    <DateTimePicker 
                        label="Ngày vào làm việc" 
                        name="startDate" 
                        notValueMillisecond={true}
                    />
                    <TextField 
                        label="Mã nhân viên" 
                        name="staffCode" 
                        readOnly
                        required
                    />
                    <TextField 
                        label="Họ và tên" 
                        name="displayName" 
                        required
                    />
                    <TextField 
                        label="Email" 
                        name="email" 
                        required
                    />
                    <SelectInput 
                        label="Trạng Thái Nhân Viên" 
                        name="workingStatus" 
                        options={WorkingStatusOptions}
                        required
                    />
                </Box>
            </FormikProvider>
        </Popup>
    );
};

export default StaffForm;

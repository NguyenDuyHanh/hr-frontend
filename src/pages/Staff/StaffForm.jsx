import React, { useMemo } from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Grid, Button } from '@mui/material';
import useStaffStore from '../../store/staffStore';
import UiTextField from '../../components/ui/UiTextField';
import UiSelectInput from '../../components/ui/UiSelectInput';
import UiDateTimePicker from '../../components/ui/UiDateTimePicker';
import UiPopup from '../../components/ui/UiPopup';
import { WorkingStatusOptions } from '../../LocalConstants';
import { getNextStaffCode, incrementStaffCode } from '../../LocalFunction';
import { format } from 'date-fns';

const StaffForm = ({ open, onClose, staffData, onSaveSuccess }) => {
    const { addStaff, modifyStaff } = useStaffStore();

    const initialValues = useMemo(() => ({
        id: staffData?.id || null,
        staffCode: staffData?.staffCode || getNextStaffCode(),
        displayName: staffData?.displayName || '',
        startDate: staffData?.startDate ? new Date(staffData.startDate) : new Date(),
        workingStatus: staffData?.workingStatus || '',
    }), [staffData]);

    const validationSchema = Yup.object({
        staffCode: Yup.string().required('Mã nhân viên là bắt buộc'),
        displayName: Yup.string().required('Họ và tên là bắt buộc'),
        workingStatus: Yup.mixed().required('Trạng thái là bắt buộc'),
    });

    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            // Format date to YYYY-MM-DD before sending to backend
            const submitValues = { ...values };
            if (values.startDate) {
                submitValues.startDate = format(new Date(values.startDate), 'yyyy-MM-dd');
            }

            if (values.id) {
                await modifyStaff(values.id, submitValues);
            } else {
                await addStaff(submitValues);
                // Increment the counter only on successful save of a new staff
                incrementStaffCode();
            }
            if (onSaveSuccess) onSaveSuccess();
        },
    });

    const action = (
        <>
            <Button onClick={onClose} variant="outlined" color="inherit" sx={{ textTransform: 'none' }}>Hủy bỏ</Button>
            <Button onClick={formik.handleSubmit} color="primary" variant="contained" sx={{ textTransform: 'none', px: 4, ml: 1 }}>Lưu lại</Button>
        </>
    );

    return (
        <UiPopup 
            open={open} 
            onClosePopup={onClose} 
            title={staffData ? 'Chỉnh sửa nhân viên' : 'Thêm mới nhân viên'}
            size="sm"
            action={action}
        >
            <FormikProvider value={formik}>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <UiDateTimePicker 
                            label="Ngày vào làm việc" 
                            name="startDate" 
                            notValueMillisecond={true}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <UiTextField 
                            label="Mã nhân viên" 
                            name="staffCode" 
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <UiTextField 
                            label="Họ và tên" 
                            name="displayName" 
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <UiSelectInput 
                            label="Trạng Thái Nhân Viên" 
                            name="workingStatus" 
                            options={WorkingStatusOptions}
                            required
                        />
                    </Grid>
                </Grid>
            </FormikProvider>
        </UiPopup>
    );
};

export default StaffForm;

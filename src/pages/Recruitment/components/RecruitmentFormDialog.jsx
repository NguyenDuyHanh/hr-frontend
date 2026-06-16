import React, { useMemo } from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Button, Box } from '@mui/material';
import Popup from '../../../components/ui/Popup';
import TextField from '../../../components/ui/TextField';
import SelectInput from '../../../components/ui/SelectInput';
import AsyncAutocomplete from '../../../components/ui/AsyncAutocomplete';
import { pagingStaffs } from '../../../services/StaffService';
import { RECRUITMENT_STATUSES } from '../../../constants';

const RecruitmentFormDialog = ({
    open,
    onClose,
    recruitmentInput,
    onSave
}) => {
    const staffSearchObj = useMemo(() => ({ pageIndex: 1, pageSize: 100 }), []);

    const initialValues = useMemo(() => ({
        id: recruitmentInput.id || null,
        code: recruitmentInput.code || '',
        name: recruitmentInput.name || '',
        personApproveCV: recruitmentInput.personApproveCVId 
            ? { id: recruitmentInput.personApproveCVId, displayName: recruitmentInput.personApproveCVName || '' } 
            : null,
        status: recruitmentInput.status ?? 1,
        description: recruitmentInput.description || ''
    }), [recruitmentInput]);

    const validationSchema = Yup.object({
        name: Yup.string().trim().required('Tiêu đề tuyển dụng là bắt buộc'),
        personApproveCV: Yup.mixed().required('Vui lòng chọn người duyệt hồ sơ'),
    });

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values) => {
            const submitValues = {
                ...values,
                personApproveCVId: values.personApproveCV?.id || null,
                personApproveCV: undefined
            };
            onSave(submitValues);
        }
    });

    const actions = (
        <>
            <Button onClick={onClose} variant="outlined" color="inherit" sx={{ textTransform: 'none' }}>Hủy bỏ</Button>
            <Button onClick={formik.handleSubmit} variant="contained" color="primary" sx={{ textTransform: 'none', ml: 1 }}>Lưu lại</Button>
        </>
    );

    return (
        <Popup
            open={open}
            onClosePopup={onClose}
            title={recruitmentInput.id ? 'Sửa tin tuyển dụng' : 'Đăng tin tuyển dụng mới'}
            size="sm"
            action={actions}
        >
            <FormikProvider value={formik}>
                <Box>
                    <TextField
                        name="code"
                        label="Mã tin tuyển dụng"
                        disabled
                        fullWidth
                    />
                    <TextField
                        name="name"
                        label="Tiêu đề tuyển dụng"
                        required
                        fullWidth
                    />
                    <AsyncAutocomplete
                        name="personApproveCV"
                        label="Người duyệt hồ sơ"
                        required
                        api={pagingStaffs}
                        searchObject={staffSearchObj}
                        placeholder="Chọn người duyệt hồ sơ..."
                        displayName="displayName"
                        fullWidth
                    />
                    <SelectInput
                        name="status"
                        label="Trạng thái tin"
                        options={RECRUITMENT_STATUSES}
                        keyValue="value"
                        displayvalue="label"
                        fullWidth
                    />
                    <TextField
                        name="description"
                        label="Mô tả công việc chi tiết (JD, yêu cầu, quyền lợi...)"
                        multiline
                        rows={6}
                        placeholder="Nhập thông tin JD..."
                        fullWidth
                    />
                </Box>
            </FormikProvider>
        </Popup>
    );
};

export default RecruitmentFormDialog;

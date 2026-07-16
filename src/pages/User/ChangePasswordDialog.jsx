import React, { useMemo } from 'react';
import { Button } from '@mui/material';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import TextField from '../../components/ui/TextField';
import Popup from '../../components/ui/Popup';
import useUserStore from '../../store/userStore';

const validationSchema = Yup.object({
    newPassword: Yup.string()
        .required('Mật khẩu mới không được để trống')
        .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: Yup.string()
        .required('Xác nhận mật khẩu không được để trống')
        .oneOf([Yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp'),
});

const ChangePasswordDialog = ({ open, onClose, user }) => {
    const { changeUserPassword } = useUserStore();

    const formik = useFormik({
        initialValues: {
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                await changeUserPassword({
                    userId: user.id,
                    newPassword: values.newPassword,
                    confirmPassword: values.confirmPassword,
                });
                resetForm();
                onClose();
            } catch (error) {
                // Error is handled by the store (toast)
            } finally {
                setSubmitting(false);
            }
        },
    });

    const action = (
        <>
            <Button 
                onClick={() => { formik.resetForm(); onClose(); }} 
                variant="outlined" 
                color="inherit"
                style={{ 
                    textTransform: 'none',
                    borderColor: '#d1d5db',
                    color: '#4b5563',
                    backgroundColor: '#f9fafb',
                    height: '32px',
                    fontSize: '0.8125rem'
                }}
                sx={{
                    '&:hover': {
                        backgroundColor: '#f3f4f6 !important',
                        borderColor: '#9ca3af !important',
                        color: '#1f2937 !important'
                    }
                }}
            >
                Hủy bỏ
            </Button>
            <Button 
                onClick={formik.handleSubmit} 
                color="primary" 
                variant="contained"
                disabled={formik.isSubmitting}
                style={{ 
                    textTransform: 'none',
                    height: '32px',
                    fontSize: '0.8125rem',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    marginLeft: '8px'
                }}
            >
                {formik.isSubmitting ? 'Đang xử lý...' : 'Xác nhận đổi'}
            </Button>
        </>
    );

    return (
        <Popup
            open={open}
            onClosePopup={() => { formik.resetForm(); onClose(); }}
            title={`Đổi mật khẩu - ${user?.username || ''}`}
            size="xs"
            action={action}
        >
            <FormikProvider value={formik}>
                <TextField 
                    label="Mật khẩu mới" 
                    name="newPassword" 
                    type="password"
                    required
                    fullWidth
                    autoComplete="new-password"
                />
                <TextField 
                    label="Xác nhận mật khẩu" 
                    name="confirmPassword" 
                    type="password"
                    required
                    fullWidth
                    autoComplete="new-password"
                />
            </FormikProvider>
        </Popup>
    );
};

export default ChangePasswordDialog;

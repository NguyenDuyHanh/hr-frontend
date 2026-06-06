import React, { useState, useEffect, useMemo } from 'react';
import { Button, Grid } from '@mui/material';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import TextField from '../../components/ui/TextField';
import CheckBox from '../../components/ui/CheckBox';
import PagingAutocomplete from '../../components/ui/PagingAutocomplete';
import Autocomplete from '../../components/ui/Autocomplete';
import Popup from '../../components/ui/Popup';
import { pagingStaffs } from '../../services/StaffService';
import useUserStore from '../../store/userStore';

const UserForm = ({ open, onClose, userData, onSaveSuccess, isView = false }) => {
    const { addUser, modifyUser, roles: allRoles, loadRoles } = useUserStore();

    useEffect(() => {
        loadRoles();
    }, [loadRoles]);

    const initialValues = useMemo(() => ({
        id: userData?.id || null,
        username: userData?.username || '',
        password: userData?.password || '',
        email: userData?.email || '',
        active: userData?.active !== undefined ? userData.active : true,
        roles: userData?.roles || [],
        staff: userData?.staffId ? { id: userData.staffId, displayName: userData.staffName, staffCode: '' } : null,
    }), [userData]);

    const validationSchema = Yup.object({
        username: Yup.string().required('Tên đăng nhập không được để trống'),
        password: userData?.id ? Yup.string().nullable() : Yup.string().required('Mật khẩu không được để trống'),
        email: Yup.string().email('Email không hợp lệ').nullable(),
    });

    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                const payload = {
                    id: values.id,
                    username: values.username,
                    password: values.password || undefined,
                    email: values.email || null,
                    active: values.active,
                    roles: values.roles,
                    staffId: values.staff?.id || null,
                };
                if (values.id) {
                    await modifyUser(values.id, payload);
                } else {
                    await addUser(payload);
                }
                if (onSaveSuccess) onSaveSuccess();
            } catch (error) {
                console.error('Error saving user', error);
            }
        },
    });

    const action = (
        <>
            <Button 
                onClick={onClose} 
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
                {isView ? 'Đóng' : 'Hủy bỏ'}
            </Button>
            {!isView && (
                <Button 
                    onClick={formik.handleSubmit} 
                    color="primary" 
                    variant="contained"
                    style={{ 
                        textTransform: 'none',
                        height: '32px',
                        fontSize: '0.8125rem',
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        marginLeft: '8px'
                    }}
                >
                    Lưu lại
                </Button>
            )}
        </>
    );

    return (
        <Popup
            open={open}
            onClosePopup={onClose}
            title={isView ? 'Chi tiết tài khoản' : (userData ? 'Cập nhật tài khoản' : 'Thêm tài khoản')}
            size="sm"
            action={action}
        >
            <FormikProvider value={formik}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField 
                            label="Tên đăng nhập" 
                            name="username" 
                            required
                            fullWidth 
                            disabled={isView}
                        />
                    </Grid>
                    {!userData && (
                        <Grid item xs={12}>
                            <TextField 
                                label="Mật khẩu" 
                                name="password" 
                                type="password"
                                required
                                fullWidth 
                                disabled={isView}
                            />
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <TextField 
                            label="Email" 
                            name="email" 
                            fullWidth 
                            disabled={isView}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <PagingAutocomplete 
                            label="Nhân viên liên kết" 
                            name="staff"
                            api={pagingStaffs}
                            disabled={isView}
                            getOptionLabel={(option) => {
                                if (!option) return "";
                                const codePart = option.staffCode ? ` (${option.staffCode})` : "";
                                return `${option.displayName || option.staffName || ''}${codePart}`;
                            }}
                            onChange={(event, value) => {
                                formik.setFieldValue('staff', value);
                                
                                // Auto-populate email and username if selecting a staff for a new user
                                if (value && !userData) {
                                    if (value.email && !formik.values.email) {
                                        formik.setFieldValue('email', value.email);
                                    }
                                    if (value.staffCode && !formik.values.username) {
                                        formik.setFieldValue('username', value.staffCode);
                                    }
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete
                            multiple
                            name="roles"
                            label="Vai trò (Quyền)"
                            placeholder="Chọn vai trò..."
                            options={allRoles}
                            getOptionLabel={(option) => option.description || option.name || ''}
                            disableCloseOnSelect
                            disabled={isView}
                        />
                    </Grid>
                </Grid>
            </FormikProvider>
        </Popup>
    );
};

export default UserForm;

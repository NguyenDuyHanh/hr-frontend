import React, { useEffect, useState } from 'react';
import { Grid, Button, Box } from '@mui/material';
import { useFormik, FormikProvider } from 'formik';
import { toast } from 'sonner';

import Popup from '../../../components/ui/Popup';
import TextField from '../../../components/ui/TextField';
import useRoleStore from '../../../store/roleStore';

const RoleForm = () => {
    const {
        openForm,
        setOpenForm,
        selectedRole,
        addRole,
        modifyRole
    } = useRoleStore();

    const [saving, setSaving] = useState(false);

    const formInitialValues = {
        name: selectedRole?.name || '',
        description: selectedRole?.description || '',
    };

    useEffect(() => {
        if (openForm) {
            formik.resetForm({
                values: {
                    name: selectedRole?.name || '',
                    description: selectedRole?.description || '',
                }
            });
        }
    }, [openForm, selectedRole]);

    const handleSave = async (values) => {
        const payload = {
            id: selectedRole ? selectedRole.id : null,
            name: values.name.trim().toUpperCase(),
            description: values.description ? values.description.trim() : ''
        };

        try {
            setSaving(true);
            if (selectedRole) {
                await modifyRole(payload);
                toast.success('Cập nhật vai trò thành công');
            } else {
                await addRole(payload);
                toast.success('Thêm vai trò mới thành công');
            }
        } catch (error) {
            console.error('Failed to save role:', error);
            const errorMsg = error.response?.data?.message || 'Lỗi khi lưu thông tin vai trò';
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const formik = useFormik({
        initialValues: formInitialValues,
        enableReinitialize: true,
        onSubmit: handleSave,
    });

    return (
        <Popup
            open={openForm}
            onClosePopup={() => setOpenForm(false)}
            title={selectedRole ? 'Cập nhật Vai trò' : 'Thêm Vai trò mới'}
            size="sm"
            action={
                <>
                    <Button onClick={() => setOpenForm(false)} color="inherit" disabled={saving}>
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={formik.handleSubmit}
                        color="primary"
                        variant="contained"
                        disabled={saving}
                    >
                        {saving ? 'Đang lưu...' : 'Lưu lại'}
                    </Button>
                </>
            }
        >
            <FormikProvider value={formik}>
                <Box sx={{ pt: 1.5 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Tên vai trò"
                                name="name"
                                required
                                placeholder="Ví dụ: ROLE_ADMIN, HR_LEADER, EMPLOYEE..."
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Mô tả"
                                name="description"
                                placeholder="Nhập mô tả chi tiết về vai trò..."
                                multiline
                                rows={3}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </FormikProvider>
        </Popup>
    );
};

export default RoleForm;

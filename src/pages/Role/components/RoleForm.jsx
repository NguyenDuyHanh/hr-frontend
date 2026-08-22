import React, { useEffect } from 'react';
import { Grid, Button, Box } from '@mui/material';
import { useFormik, FormikProvider } from 'formik';

import Popup from '../../../components/ui/Popup';
import TextField from '../../../components/ui/TextField';
import useRoleStore from '../../../store/roleStore';
import { useAddRole, useModifyRole } from '../api';

const RoleForm = () => {
    const {
        openForm,
        setOpenForm,
        selectedRole,
    } = useRoleStore();

    const addRoleMutation = useAddRole();
    const modifyRoleMutation = useModifyRole();

    const saving = addRoleMutation.isPending || modifyRoleMutation.isPending;

    const formik = useFormik({
        initialValues: {
            name: selectedRole?.name || '',
            description: selectedRole?.description || '',
        },
        enableReinitialize: true,
        onSubmit: async (values) => {
            const payload = {
                id: selectedRole ? selectedRole.id : null,
                name: values.name.trim().toUpperCase(),
                description: values.description ? values.description.trim() : ''
            };

            try {
                if (selectedRole) {
                    await modifyRoleMutation.mutateAsync(payload);
                } else {
                    await addRoleMutation.mutateAsync(payload);
                }
                setOpenForm(false);
            } catch (error) {
                console.error('Failed to save role:', error);
            }
        },
    });

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

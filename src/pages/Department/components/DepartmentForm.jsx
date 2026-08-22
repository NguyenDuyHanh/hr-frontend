import React, { useEffect } from 'react';
import { Grid, Button, Box } from '@mui/material';
import { useFormik, FormikProvider } from 'formik';

import Popup from '../../../components/ui/Popup';
import TextField from '../../../components/ui/TextField';
import useDepartmentStore from '../../../store/departmentStore';
import { useAddDepartment, useModifyDepartment, useDepartmentCode } from '../api';

const DepartmentForm = () => {
    const {
        openForm,
        setOpenForm,
        selectedDepartment,
    } = useDepartmentStore();

    const addDepartmentMutation = useAddDepartment();
    const modifyDepartmentMutation = useModifyDepartment();
    const { data: autoCode } = useDepartmentCode(openForm, selectedDepartment);

    const saving = addDepartmentMutation.isPending || modifyDepartmentMutation.isPending;

    const formik = useFormik({
        initialValues: {
            name: selectedDepartment?.name || '',
            code: selectedDepartment?.code || autoCode || '',
            description: selectedDepartment?.description || '',
        },
        enableReinitialize: true,
        onSubmit: async (values) => {
            const payload = {
                id: selectedDepartment ? selectedDepartment.id : null,
                name: values.name.trim(),
                code: values.code.toUpperCase().trim(),
                description: values.description ? values.description.trim() : ''
            };

            try {
                if (selectedDepartment) {
                    await modifyDepartmentMutation.mutateAsync(payload);
                } else {
                    await addDepartmentMutation.mutateAsync(payload);
                }
                setOpenForm(false);
            } catch (error) {
                console.error('Failed to save department:', error);
            }
        },
    });

    useEffect(() => {
        if (openForm) {
            formik.resetForm({
                values: {
                    name: selectedDepartment?.name || '',
                    code: selectedDepartment?.code || autoCode || '',
                    description: selectedDepartment?.description || '',
                }
            });
        }
    }, [openForm, selectedDepartment, autoCode]);

    return (
        <Popup
            open={openForm}
            onClosePopup={() => setOpenForm(false)}
            title={selectedDepartment ? 'Cập nhật Phòng ban' : 'Thêm Phòng ban mới'}
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
                                label="Tên phòng ban"
                                name="name"
                                required
                                placeholder="Ví dụ: Phòng Kỹ thuật, Ban Giám đốc..."
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Mã phòng ban"
                                name="code"
                                required
                                placeholder="Ví dụ: PB01, NS, KT"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Mô tả"
                                name="description"
                                placeholder="Nhập mô tả chi tiết về chức năng nhiệm vụ..."
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

export default DepartmentForm;

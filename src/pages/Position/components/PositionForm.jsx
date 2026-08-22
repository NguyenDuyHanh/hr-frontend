import React, { useEffect, useMemo } from 'react';
import { Grid, Button, Box } from '@mui/material';
import { useFormik, FormikProvider } from 'formik';

import Popup from '../../../components/ui/Popup';
import TextField from '../../../components/ui/TextField';
import SelectInput from '../../../components/ui/SelectInput';
import usePositionStore from '../../../store/positionStore';
import { useAddPosition, useModifyPosition, usePositionCode, useAllDepartmentsQuery } from '../api';

const PositionForm = () => {
    const {
        openForm,
        setOpenForm,
        selectedPosition,
    } = usePositionStore();

    const addPositionMutation = useAddPosition();
    const modifyPositionMutation = useModifyPosition();
    const { data: autoCode } = usePositionCode(openForm, selectedPosition);
    const { data: departments = [] } = useAllDepartmentsQuery(openForm);

    const saving = addPositionMutation.isPending || modifyPositionMutation.isPending;

    const formik = useFormik({
        initialValues: {
            name: selectedPosition?.name || '',
            code: selectedPosition?.code || autoCode || '',
            departmentId: selectedPosition?.departmentId || '',
            description: selectedPosition?.description || '',
        },
        enableReinitialize: true,
        onSubmit: async (values) => {
            const payload = {
                id: selectedPosition ? selectedPosition.id : null,
                name: values.name.trim(),
                code: values.code.toUpperCase().trim(),
                departmentId: values.departmentId || null,
                description: values.description ? values.description.trim() : ''
            };

            try {
                if (selectedPosition) {
                    await modifyPositionMutation.mutateAsync(payload);
                } else {
                    await addPositionMutation.mutateAsync(payload);
                }
                setOpenForm(false);
            } catch (error) {
                console.error('Failed to save position:', error);
            }
        },
    });

    useEffect(() => {
        if (openForm) {
            formik.resetForm({
                values: {
                    name: selectedPosition?.name || '',
                    code: selectedPosition?.code || autoCode || '',
                    departmentId: selectedPosition?.departmentId || '',
                    description: selectedPosition?.description || '',
                }
            });
        }
    }, [openForm, selectedPosition, autoCode]);

    const deptOptions = useMemo(() => {
        return departments.map(d => ({
            value: d.id,
            name: `${d.name} (${d.code})`
        }));
    }, [departments]);

    return (
        <Popup
            open={openForm}
            onClosePopup={() => setOpenForm(false)}
            title={selectedPosition ? 'Cập nhật Vị trí' : 'Thêm Vị trí mới'}
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
                                label="Tên vị trí/Chức danh"
                                name="name"
                                required
                                placeholder="Ví dụ: Lập trình viên Java, Trưởng phòng KT..."
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Mã vị trí"
                                name="code"
                                required
                                placeholder="Ví dụ: VT01, DEV_JAVA, GD"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <SelectInput
                                label="Phòng ban trực thuộc"
                                name="departmentId"
                                options={deptOptions}
                                keyValue="value"
                                displayvalue="name"
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Mô tả"
                                name="description"
                                placeholder="Nhập mô tả ngắn về vai trò hoặc yêu cầu công việc..."
                                multiline
                                rows={2}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </FormikProvider>
        </Popup>
    );
};

export default PositionForm;

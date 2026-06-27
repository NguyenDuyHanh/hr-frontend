import React, { useEffect, useState } from 'react';
import { Grid, Button, Box } from '@mui/material';
import { useFormik, FormikProvider } from 'formik';
import { toast } from 'sonner';

import Popup from '../../../components/ui/Popup';
import TextField from '../../../components/ui/TextField';
import useDepartmentStore from '../../../store/departmentStore';
import { generateDepartmentCode } from '../../../services/departmentService';

const DepartmentForm = () => {
    const {
        openForm,
        setOpenForm,
        selectedDepartment,
        addDepartment,
        modifyDepartment
    } = useDepartmentStore();

    const [saving, setSaving] = useState(false);
    const [autoCode, setAutoCode] = useState('');

    useEffect(() => {
        const fetchCode = async () => {
            if (openForm && !selectedDepartment) {
                try {
                    const codeRes = await generateDepartmentCode();
                    if (codeRes && codeRes.data) {
                        setAutoCode(codeRes.data);
                    }
                } catch (e) {
                    console.error("Failed to generate department code", e);
                }
            }
        };
        fetchCode();
    }, [openForm, selectedDepartment]);

    const formInitialValues = {
        name: selectedDepartment?.name || '',
        code: selectedDepartment?.code || autoCode || '',
        description: selectedDepartment?.description || '',
    };

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

    const handleSave = async (values) => {
        const payload = {
            id: selectedDepartment ? selectedDepartment.id : null,
            name: values.name.trim(),
            code: values.code.toUpperCase().trim(),
            description: values.description ? values.description.trim() : ''
        };

        try {
            setSaving(true);
            if (selectedDepartment) {
                await modifyDepartment(payload);
                toast.success('Cập nhật phòng ban thành công');
            } else {
                await addDepartment(payload);
                toast.success('Thêm phòng ban mới thành công');
            }
        } catch (error) {
            console.error('Failed to save department:', error);
            const errorMsg = error.response?.data?.message || 'Lỗi khi lưu thông tin phòng ban';
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

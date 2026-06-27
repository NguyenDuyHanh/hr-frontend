import React, { useEffect, useState, useMemo } from 'react';
import { Grid, Button, Box } from '@mui/material';
import { useFormik, FormikProvider } from 'formik';
import { toast } from 'sonner';

import Popup from '../../../components/ui/Popup';
import TextField from '../../../components/ui/TextField';
import SelectInput from '../../../components/ui/SelectInput';
import usePositionStore from '../../../store/positionStore';
import { getAllDepartments } from '../../../services/departmentService';
import { generatePositionCode } from '../../../services/positionService';

const PositionForm = () => {
    const {
        openForm,
        setOpenForm,
        selectedPosition,
        addPosition,
        modifyPosition
    } = usePositionStore();

    const [saving, setSaving] = useState(false);
    const [autoCode, setAutoCode] = useState('');
    const [departments, setDepartments] = useState([]);

    // Fetch departments for select dropdown
    useEffect(() => {
        const fetchDepts = async () => {
            if (openForm) {
                try {
                    const response = await getAllDepartments();
                    if (response && response.data) {
                        setDepartments(response.data || []);
                    }
                } catch (error) {
                    console.error('Failed to load departments list for dropdown:', error);
                }
            }
        };
        fetchDepts();
    }, [openForm]);

    // Fetch auto-generated code for new position
    useEffect(() => {
        const fetchCode = async () => {
            if (openForm && !selectedPosition) {
                try {
                    const codeRes = await generatePositionCode();
                    if (codeRes && codeRes.data) {
                        setAutoCode(codeRes.data);
                    }
                } catch (e) {
                    console.error("Failed to generate position code", e);
                }
            }
        };
        fetchCode();
    }, [openForm, selectedPosition]);

    const formInitialValues = {
        name: selectedPosition?.name || '',
        code: selectedPosition?.code || autoCode || '',
        departmentId: selectedPosition?.departmentId || '',
        description: selectedPosition?.description || '',
    };

    // Update formik when autoCode is fetched or selectedPosition changes
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

    const handleSave = async (values) => {
        const payload = {
            id: selectedPosition ? selectedPosition.id : null,
            name: values.name.trim(),
            code: values.code.toUpperCase().trim(),
            departmentId: values.departmentId || null,
            description: values.description ? values.description.trim() : ''
        };

        try {
            setSaving(true);
            if (selectedPosition) {
                await modifyPosition(payload);
                toast.success('Cập nhật vị trí thành công');
            } else {
                await addPosition(payload);
                toast.success('Thêm vị trí mới thành công');
            }
        } catch (error) {
            console.error('Failed to save position:', error);
            const errorMsg = error.response?.data?.message || 'Lỗi khi lưu thông tin vị trí';
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

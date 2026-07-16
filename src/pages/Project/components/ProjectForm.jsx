import React, { useMemo } from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Grid, Button, Box } from '@mui/material';
import useProjectStore from '../../../store/useProjectStore';
import TextField from '../../../components/ui/TextField';
import SelectInput from '../../../components/ui/SelectInput';
import DateTimePicker from '../../../components/ui/DateTimePicker';
import Popup from '../../../components/ui/Popup';
import { format } from 'date-fns';

const ProjectForm = ({ open, onClose, projectData, onSaveSuccess }) => {
    const { addProject, modifyProject } = useProjectStore();

    const initialValues = useMemo(() => ({
        id: projectData?.id || null,
        name: projectData?.name || '',
        code: projectData?.code || '',
        description: projectData?.description || '',
        isPublic: projectData?.isPublic ?? false,
        startDate: projectData?.startDate ? new Date(projectData.startDate) : new Date(),
        endDate: projectData?.endDate ? new Date(projectData.endDate) : null,
    }), [projectData]);

    const validationSchema = Yup.object({
        name: Yup.string().required('Tên dự án là bắt buộc'),
    });

    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const submitValues = { ...values };
            if (values.startDate) {
                submitValues.startDate = format(new Date(values.startDate), 'yyyy-MM-dd');
            }
            if (values.endDate) {
                submitValues.endDate = format(new Date(values.endDate), 'yyyy-MM-dd');
            }

            if (values.id) {
                await modifyProject(values.id, submitValues);
            } else {
                await addProject(submitValues);
            }
            if (onSaveSuccess) onSaveSuccess();
        },
    });

    const action = (
        <>
            <Button onClick={onClose} variant="outlined" color="inherit" sx={{ color: 'text.secondary', textTransform: 'none' }}>Hủy bỏ</Button>
            <Button onClick={formik.handleSubmit} color="primary" variant="contained" sx={{ textTransform: 'none', px: 4, ml: 1 }}>Lưu lại</Button>
        </>
    );

    return (
        <Popup 
            open={open} 
            onClosePopup={onClose} 
            title={projectData ? 'Chỉnh sửa dự án' : 'Thêm mới dự án'}
            size="sm"
            action={action}
        >
            <FormikProvider value={formik}>
                <Box sx={{ pt: 1.5 }}>
                    <Grid container spacing={2} className='pb-0'>
                        <Grid item xs={12}>
                            <TextField 
                                label="Tên dự án" 
                                name="name" 
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                label="Mã dự án" 
                                name="code" 
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                label="Mô tả" 
                                name="description" 
                                multiline
                                rows={3}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DateTimePicker 
                                label="Ngày bắt đầu" 
                                name="startDate" 
                                notValueMillisecond={true}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DateTimePicker 
                                label="Ngày kết thúc" 
                                name="endDate" 
                                notValueMillisecond={true}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </FormikProvider>
        </Popup>
    );
};

export default ProjectForm;

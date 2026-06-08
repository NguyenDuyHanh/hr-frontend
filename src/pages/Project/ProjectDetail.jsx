import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Paper, Typography, Box, Button, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { Formik, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { getProjectById, saveProject } from '../../services/projectService';
import ProjectActivity from './components/ProjectTabs/ProjectActivity';
import ProjectWorkingStatus from './components/ProjectTabs/ProjectWorkingStatus';
import TabComponent from '../../components/ui/Tab/TabComponent';
import ProjectGeneralInfo from './components/ProjectTabs/ProjectGeneralInfo';

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isViewMode = location.pathname.endsWith('/view');
    const [project, setProject] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadProjectDetails = async () => {
        setLoading(true);
        try {
            const res = await getProjectById(id);
            setProject(res?.data || null);
        } catch (err) {
            console.error(err);
            toast.error("Không thể tải thông tin dự án");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadProjectDetails();
        }
    }, [id]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const initialValues = useMemo(() => ({
        name: project?.name || '',
        code: project?.code || '',
        description: project?.description || '',
        startDate: project?.startDate ? new Date(project.startDate) : null,
        endDate: project?.endDate ? new Date(project.endDate) : null,
        isFinished: project?.isFinished || false,
        staffs: project?.staffs || [],
        selectedStaffForAdd: project?.staffs ? project.staffs.map(ps => ({
            id: ps.staffId,
            staffCode: ps.staffCode,
            displayName: ps.displayName,
            email: ps.email
        })) : [],
    }), [project]);

    const validationSchema = Yup.object({
        name: Yup.string().required('Tên dự án là bắt buộc'),
        code: Yup.string().required('Mã dự án là bắt buộc'),
    });

    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            const submitValues = {
                id: id,
                name: values.name,
                code: values.code,
                description: values.description,
                startDate: values.startDate ? format(new Date(values.startDate), 'yyyy-MM-dd') : null,
                endDate: values.endDate ? format(new Date(values.endDate), 'yyyy-MM-dd') : null,
                isFinished: values.isFinished,
                staffs: values.staffs.map(m => ({
                    staffId: m.staffId,
                    projectRole: m.projectRole || 'MEMBER',
                    joinedDate: m.joinedDate ? (typeof m.joinedDate === 'string' ? m.joinedDate : format(new Date(m.joinedDate), 'yyyy-MM-dd')) : format(new Date(), 'yyyy-MM-dd')
                }))
            };

            try {
                await saveProject(submitValues);
                toast.success("Cập nhật dự án thành công!");
                loadProjectDetails();
            } catch (err) {
                console.error(err);
                toast.error("Không thể lưu thay đổi");
            } finally {
                setSubmitting(false);
            }
        },
    });



    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Đang tải thông tin chi tiết dự án...</div>
            </div>
        );
    }

    if (!project) {
        return (
            <Paper className="p-6 text-center border border-border">
                <Typography variant="h6" color="error">
                    Không tìm thấy thông tin dự án
                </Typography>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate('/timesheet/project')}
                    className="mt-4"
                >
                    Quay lại danh sách
                </Button>
            </Paper>
        );
    }

    const tabList = [
        {
            label: "Thông tin chung",
            content: (
                <ProjectGeneralInfo formik={formik} isViewMode={isViewMode} />
            )
        },
        {
            label: "Hoạt động",
            content: (
                <Box mt={2}>
                    <ProjectActivity projectId={project.id} />
                </Box>
            )
        },
        {
            label: "Trạng thái thực hiện",
            content: (
                <Box mt={2}>
                    <ProjectWorkingStatus projectId={project.id} />
                </Box>
            )
        }
    ];

    return (
        <FormikProvider value={formik}>
            <div className="space-y-4">
                {/* Header / Info bar */}
                <Paper elevation={0} className="p-2 sm:p-4 border border-border">
                    <div className="flex justify-between items-center mb-2">
                        <Button 
                            startIcon={<ArrowBackIcon />} 
                            onClick={() => navigate('/projects')}
                            sx={{ textTransform: 'none', color: 'text.secondary' }}
                            size="small"
                        >
                            Danh sách dự án
                        </Button>
                        {!isViewMode && (
                            <Button 
                                variant="contained" 
                                color="primary" 
                                startIcon={<SaveIcon />}
                                onClick={formik.handleSubmit}
                                disabled={formik.isSubmitting}
                            >
                                {formik.isSubmitting ? 'Đang lưu...' : 'Lưu'}
                            </Button>
                        )}
                        {isViewMode && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => navigate(`/projects/${id}/edit`)}
                                sx={{ textTransform: 'none' }}
                            >
                                Chỉnh sửa
                            </Button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Typography variant="h5" className="font-bold text-foreground">
                            {project.name}
                        </Typography>
                        <Chip 
                            label={project.code} 
                            size="small" 
                            className="font-mono font-bold"
                            color="primary" 
                            variant="outlined"
                        />
                        <Chip 
                            label={formik.values.isFinished ? "Đã hoàn thành" : "Đang thực hiện"} 
                            color={formik.values.isFinished ? "success" : "warning"}
                            size="small" 
                        />
                    </div>
                </Paper>

                {/* Tabs content */}
                <Paper elevation={0} className="px-4 border border-border">
                    <TabComponent 
                        tabList={tabList} 
                        value={tabValue} 
                        handleChange={handleTabChange} 
                    />
                </Paper>
            </div>
        </FormikProvider>
    );
};

export default ProjectDetail;

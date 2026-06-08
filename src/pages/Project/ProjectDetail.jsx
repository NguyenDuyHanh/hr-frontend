import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Paper, Typography, Box, Button, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'sonner';

import { getProjectById } from '../../services/projectService';
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
                    onClick={() => navigate('/projects')}
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
                <ProjectGeneralInfo 
                    project={project} 
                    isViewMode={isViewMode} 
                    onSaved={loadProjectDetails} 
                />
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
                        label={project.isFinished ? "Đã hoàn thành" : "Đang thực hiện"} 
                        color={project.isFinished ? "success" : "warning"}
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
    );
};

export default ProjectDetail;

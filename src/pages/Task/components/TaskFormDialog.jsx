import React, { useMemo, useEffect, useState } from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Grid, Button, Paper, Box, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Popup from '../../../components/ui/Popup';
import TextField from '../../../components/ui/TextField';
import SelectInput from '../../../components/ui/SelectInput';
import DateTimePicker from '../../../components/ui/DateTimePicker';
import AsyncAutocomplete from '../../../components/ui/AsyncAutocomplete';
import Editor from '../../../components/ui/Editor';
import TaskHistorySection from './TaskHistorySection';
import useTaskStore from '../../../store/useTaskStore';
import { pagingProjects, getProjectWorkingStatuses, getProjectActivities, getProjectStaffs } from '../../../services/projectService';
import { uploadTaskAttachmentLink, deleteTaskAttachment } from '../../../services/taskService';
import { uploadFile } from '../../../services/CloudinaryService';
import { TASK_PRIORITY_OPTIONS } from '../../../constants/taskConstants';
import { toast } from 'sonner';

const TaskFormDialog = ({ open, onClose, taskData, onSaveSuccess, isViewMode = false }) => {
    const { addTask, modifyTask } = useTaskStore();
    const [statuses, setStatuses] = useState([]);
    const [activities, setActivities] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const initialValues = useMemo(() => {
        return {
            id: taskData?.id || null,
            name: taskData?.name || '',
            description: taskData?.description || '',
            priority: taskData?.priority || 1,
            startTime: taskData?.startTime ? new Date(taskData.startTime).getTime() : null,
            endTime: taskData?.endTime ? new Date(taskData.endTime).getTime() : null,
            estimateHour: taskData?.estimateHour !== undefined ? taskData.estimateHour : '',
            projectId: (() => {
                if (!taskData?.projectId) return null;
                if (typeof taskData.projectId === 'object') {
                    return {
                        id: taskData.projectId.id,
                        name: taskData.projectId.name || taskData.projectName
                    };
                }
                return {
                    id: taskData.projectId,
                    name: taskData.projectName
                };
            })(),
            activityId: taskData?.activityId || null,
            statusId: taskData?.statusId || null,
            assigneeId: taskData?.assigneeId ? { id: taskData.assigneeId, displayName: taskData.assigneeName } : null,
            attachments: taskData?.attachments || []
        };
    }, [taskData]);

    const validationSchema = Yup.object({
        name: Yup.string().trim().required('Tên công việc không được để trống'),
        projectId: Yup.mixed().required('Vui lòng chọn dự án'),
        statusId: Yup.string().required('Vui lòng chọn trạng thái'),
        priority: Yup.number().required('Vui lòng chọn độ ưu tiên'),
    });

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values) => {
            const payload = {
                id: values.id,
                name: values.name.trim(),
                description: values.description,
                priority: Number(values.priority),
                startTime: values.startTime ? new Date(values.startTime).toISOString() : null,
                endTime: values.endTime ? new Date(values.endTime).toISOString() : null,
                estimateHour: values.estimateHour ? Number(values.estimateHour) : null,
                projectId: values.projectId?.id || values.projectId,
                activityId: values.activityId?.id || values.activityId || null,
                statusId: values.statusId,
                assigneeId: values.assigneeId?.id || values.assigneeId || null
            };

            try {
                if (values.id) {
                    await modifyTask(values.id, payload);
                    toast.success("Cập nhật công việc thành công");
                } else {
                    await addTask(payload);
                    toast.success("Tạo công việc thành công");
                }
                if (onSaveSuccess) onSaveSuccess();
                onClose();
            } catch (error) {
                console.error("Save task error:", error);
                toast.error("Không thể lưu công việc. Vui lòng kiểm tra lại dữ liệu.");
            }
        }
    });

    const projectId = formik.values.projectId?.id || formik.values.projectId;
    const [prevProjectId, setPrevProjectId] = useState(projectId);

    // Reset dependent fields when project changes manually
    useEffect(() => {
        if (projectId !== prevProjectId) {
            formik.setFieldValue('assigneeId', null);
            formik.setFieldValue('statusId', '');
            formik.setFieldValue('activityId', null);
            setPrevProjectId(projectId);
        }
    }, [projectId, prevProjectId]);

    // Load working statuses and activities when project selection changes
    useEffect(() => {
        if (projectId) {
            getProjectWorkingStatuses(projectId)
                .then((res) => {
                    const statusList = res.data || [];
                    setStatuses(statusList);
                    // Set default status if it is a new task or if statusId was reset
                    if (!formik.values.statusId && statusList.length > 0) {
                        formik.setFieldValue('statusId', statusList[0].id);
                    }
                })
                .catch((err) => {
                    console.error("Error loading statuses:", err);
                    setStatuses([]);
                });

            getProjectActivities(projectId)
                .then((res) => {
                    setActivities(res.data || []);
                    formik.setFieldValue('activityId', formik.values.activityId ?? null, false);
                })
                .catch((err) => {
                    console.error("Error loading activities:", err);
                    setActivities([]);
                });
        } else {
            setStatuses([]);
            setActivities([]);
        }
    }, [projectId]);

    // Update internal attachments state when values.attachments changes
    useEffect(() => {
        if (formik.values.attachments) {
            setAttachments(formik.values.attachments);
        }
    }, [formik.values.attachments]);

    const handleUploadAttachment = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        console.log("Selected file for upload:", file);
        console.log("File name:", file.name, "File size (bytes):", file.size);

        if (file.size === 0) {
            toast.error("Tập tin được chọn bị rỗng (0 bytes). Vui lòng chọn tập tin khác!");
            return;
        }

        if (!formik.values.id) {
            toast.warning("Vui lòng lưu thông tin công việc trước khi tải tập tin đính kèm.");
            return;
        }

        setIsUploading(true);
        try {
            // 1. Upload file to Cloudinary
            const secureUrl = await uploadFile(file);

            // 2. Call backend to save attachment metadata
            const res = await uploadTaskAttachmentLink(formik.values.id, {
                name: file.name,
                size: file.size,
                filePath: secureUrl
            });

            if (res.data) {
                const newAttachments = [...attachments, res.data];
                setAttachments(newAttachments);
                formik.setFieldValue('attachments', newAttachments);
                toast.success("Tải tập tin lên thành công");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Không thể tải tập tin lên");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteAttachment = async (attId) => {
        try {
            await deleteTaskAttachment(attId);
            const newAttachments = attachments.filter(a => a.id !== attId);
            setAttachments(newAttachments);
            formik.setFieldValue('attachments', newAttachments);
            toast.success("Xóa tập tin đính kèm thành công");
        } catch (error) {
            console.error("Delete attachment error:", error);
            toast.error("Không thể xóa tập tin đính kèm");
        }
    };

    const fetchProjectStaffsApi = useMemo(() => {
        return async (searchObj) => {
            const currentProjId = searchObj?.projectId;
            if (!currentProjId) {
                return { data: [] };
            }
            return getProjectStaffs(currentProjId);
        };
    }, []);

    const projectSearchObj = useMemo(() => ({ pageIndex: 1, pageSize: 100 }), []);
    const projectStaffSearchObj = useMemo(() => ({ projectId }), [projectId]);

    const actions = (
        <>
            <Button onClick={onClose} variant="outlined" color="inherit" sx={{ textTransform: 'none' }}>
                {isViewMode ? 'Đóng' : 'Hủy bỏ'}
            </Button>
            {!isViewMode && (
                <Button onClick={formik.handleSubmit} variant="contained" color="primary" sx={{ textTransform: 'none', ml: 1 }}>
                    Lưu lại
                </Button>
            )}
        </>
    );

    return (
        <Popup
            open={open}
            onClosePopup={onClose}
            title={isViewMode ? `Chi tiết công việc: ${taskData?.code}` : (taskData?.id ? `Chỉnh sửa công việc: ${taskData.code}` : "Thêm công việc mới")}
            size="lg"
            action={actions}
        >
            <FormikProvider value={formik}>
                <Grid container spacing={3}>
                    {/* Cột trái (2/3) - Mô tả, File đính kèm, Lịch sử */}
                    <Grid item xs={12} md={8}>
                        <Paper elevation={0} className="p-4 border border-border space-y-4">
                            <TextField 
                                name="name" 
                                label="Tên công việc" 
                                required 
                                disabled={isViewMode}
                            />

                            <AsyncAutocomplete
                                name="projectId"
                                label="Dự án"
                                required
                                api={pagingProjects}
                                searchObject={projectSearchObj}
                                placeholder="Chọn dự án..."
                                displayName="name"
                                disabled={isViewMode}
                            />

                            <Editor 
                                name="description" 
                                label="Mô tả công việc" 
                                fullWidth 
                                readOnly={isViewMode}
                            />

                            {/* Files đính kèm */}
                            <Box className="mt-4">
                                <Box className="flex justify-between items-center mb-2">
                                    <Typography variant="subtitle2" className="font-semibold text-gray-700 dark:text-gray-300">
                                        Tài liệu đính kèm
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        startIcon={isUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                                        size="small"
                                        sx={{ textTransform: 'none' }}
                                        disabled={!formik.values.id || isUploading || isViewMode}
                                    >
                                        {isUploading ? 'Đang tải lên...' : 'Tải file lên'}
                                        <input
                                            type="file"
                                            hidden
                                            onChange={handleUploadAttachment}
                                            disabled={isUploading || isViewMode}
                                        />
                                    </Button>
                                </Box>
                                
                                {!formik.values.id && (
                                    <Typography variant="caption" className="text-gray-400 block mb-2">
                                        (Lưu thông tin công việc trước để kích hoạt tính năng đính kèm tệp)
                                    </Typography>
                                )}

                                {attachments.length > 0 ? (
                                    <List className="bg-gray-50/50 dark:bg-gray-800/10">
                                        {attachments.map((file) => (
                                            <ListItem key={file.id} className='border border-border mt-1'>
                                                <AttachFileIcon className="text-gray-400 mr-2" />
                                                <ListItemText 
                                                    primary={file.name} 
                                                    secondary={`${(file.size / 1024).toFixed(1)} KB`} 
                                                />
                                                <ListItemSecondaryAction>
                                                    {!isViewMode && (
                                                        <IconButton edge="end" color="error" size="small" onClick={() => handleDeleteAttachment(file.id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    )}
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Typography variant="body2" className="text-gray-400 text-center py-4 border border-dashed border-border rounded-md">
                                        Không có tệp đính kèm nào.
                                    </Typography>
                                )}
                            </Box>
                        </Paper>

                        {/* Phần lịch sử & bình luận */}
                        {formik.values.id && (
                            <TaskHistorySection taskId={formik.values.id} />
                        )}
                    </Grid>

                    {/* Cột phải (1/3) - Assignee, Dates, Priorities, etc. */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} className="p-4 border border-border space-y-4">
                            <AsyncAutocomplete
                                name="assigneeId"
                                label="Người phụ trách"
                                api={fetchProjectStaffsApi}
                                searchObject={projectStaffSearchObj}
                                placeholder="Chọn người phụ trách..."
                                displayName="displayName"
                                disabled={isViewMode || !projectId}
                            />



                            <SelectInput
                                name="statusId"
                                label="Trạng thái thực hiện"
                                required
                                options={statuses}
                                keyValue="id"
                                displayvalue="name"
                                disabled={isViewMode || !projectId}
                            />

                            <SelectInput
                                name="priority"
                                label="Độ ưu tiên"
                                required
                                options={TASK_PRIORITY_OPTIONS}
                                keyValue="value"
                                displayvalue="label"
                                disabled={isViewMode}
                            />

                            <SelectInput
                                name="activityId"
                                label="Hoạt động dự án"
                                options={activities}
                                keyValue="id"
                                displayvalue="name"
                                disabled={isViewMode || !projectId}
                            />

                            <DateTimePicker
                                name="startTime"
                                label="Bắt đầu"
                                isDateTimePicker
                                disabled={isViewMode}
                            />

                            <DateTimePicker
                                name="endTime"
                                label="Kết thúc"
                                isDateTimePicker
                                disabled={isViewMode}
                            />

                            <TextField
                                name="estimateHour"
                                label="Giờ ước tính"
                                type="number"
                                disabled={isViewMode}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </FormikProvider>
        </Popup>
    );
};

export default TaskFormDialog;

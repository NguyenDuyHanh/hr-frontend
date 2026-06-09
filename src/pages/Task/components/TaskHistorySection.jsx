import React, { useEffect, useState } from 'react';
import { Paper, Typography, Button, Box, IconButton, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Formik, Form } from 'formik';
import Editor from '../../../components/ui/Editor';
import useTaskStore from '../../../store/useTaskStore';
import useAuthStore from '../../../store/useAuthStore';
import { formatDate } from '../../../LocalFunction';
import { toast } from 'sonner';

const TaskHistorySection = ({ taskId }) => {
    const { 
        taskHistory, 
        loadTaskHistory, 
        addComment, 
        modifyComment, 
        removeComment,
        historyLoading 
    } = useTaskStore();

    const { user } = useAuthStore();
    const [editingCommentId, setEditingCommentId] = useState(null);

    useEffect(() => {
        if (taskId) {
            loadTaskHistory(taskId);
        }
    }, [taskId]);

    const handleAddComment = async (text) => {
        try {
            await addComment(taskId, text);
            toast.success("Đăng bình luận thành công");
        } catch (error) {
            toast.error("Không thể đăng bình luận");
        }
    };

    const handleEditComment = async (commentId, text) => {
        try {
            await modifyComment(commentId, text, taskId);
            setEditingCommentId(null);
            toast.success("Cập nhật bình luận thành công");
        } catch (error) {
            toast.error("Không thể cập nhật bình luận");
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
            try {
                await removeComment(commentId, taskId);
                toast.success("Xóa bình luận thành công");
            } catch (error) {
                toast.error("Không thể xóa bình luận");
            }
        }
    };

    const isManagerOrAdmin = user?.role?.some(r => r === 'ROLE_ADMIN' || r === 'HR_MANAGER');
    const staffId = user?.staff?.id;

    return (
        <Box className="mt-6">
            <Typography variant="h6" className="mb-4 font-semibold text-gray-800 dark:text-gray-200">
                Lịch sử & Bình luận
            </Typography>

            {/* Form thêm bình luận */}
            <Paper elevation={0} className="p-4 border border-border mb-6">
                <Formik
                    initialValues={{ commentText: '' }}
                    onSubmit={(values, { resetForm }) => {
                        if (values.commentText && values.commentText.replace(/<[^>]*>/g, '').trim()) {
                            handleAddComment(values.commentText);
                            resetForm();
                        } else {
                            toast.warning("Vui lòng nhập nội dung bình luận");
                        }
                    }}
                >
                    {({ values, setFieldValue }) => (
                        <Form>
                            <Editor 
                                name="commentText" 
                                placeholder="Viết bình luận hoặc nội dung thảo luận..." 
                                fullWidth
                            />
                            <Box className="flex justify-end mt-2">
                                <Button type="submit" variant="contained" color="primary" size="small">
                                    Bình luận
                                </Button>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </Paper>

            {/* Danh sách lịch sử & bình luận */}
            <Box className="space-y-4">
                {historyLoading && taskHistory.length === 0 ? (
                    <Typography className="text-gray-500 text-center py-4">Đang tải...</Typography>
                ) : taskHistory.length === 0 ? (
                    <Typography className="text-gray-500 text-center py-4">Chưa có bình luận hay lịch sử hoạt động.</Typography>
                ) : (
                    taskHistory.map((item) => {
                        const isComment = item.comment && item.comment.trim().length > 0;
                        const modifierName = item.modifierName || 'Hệ thống';
                        const isOwner = item.modifierId && item.modifierId === staffId;
                        const canModify = isOwner || isManagerOrAdmin;

                        if (isComment) {
                            return (
                                <Paper key={item.id} elevation={0} className="p-4 border border-border hover:shadow-sm transition-shadow">
                                    <Box className="flex justify-between items-start mb-2">
                                        <Box>
                                            <Typography variant="subtitle2" className="font-semibold text-gray-800 dark:text-gray-200">
                                                {modifierName}
                                            </Typography>
                                            <Typography variant="caption" className="text-gray-500">
                                                {formatDate(item.createDate, "dd/MM/yyyy HH:mm")}
                                            </Typography>
                                        </Box>
                                        {canModify && editingCommentId !== item.id && (
                                            <Box>
                                                <IconButton size="small" onClick={() => setEditingCommentId(item.id)} title="Sửa">
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteComment(item.id)} title="Xóa">
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </Box>

                                    {editingCommentId === item.id ? (
                                        <Formik
                                            initialValues={{ editCommentText: item.comment }}
                                            onSubmit={(values) => {
                                                if (values.editCommentText && values.editCommentText.replace(/<[^>]*>/g, '').trim()) {
                                                    handleEditComment(item.id, values.editCommentText);
                                                } else {
                                                    toast.warning("Vui lòng nhập nội dung bình luận");
                                                }
                                            }}
                                        >
                                            {() => (
                                                <Form>
                                                    <Editor 
                                                        name="editCommentText" 
                                                        placeholder="Sửa bình luận..." 
                                                        fullWidth
                                                    />
                                                    <Box className="flex justify-end gap-2 mt-2">
                                                        <Button size="small" onClick={() => setEditingCommentId(null)}>Hủy</Button>
                                                        <Button type="submit" variant="contained" size="small" color="primary">Lưu</Button>
                                                    </Box>
                                                </Form>
                                            )}
                                        </Formik>
                                    ) : (
                                        <Typography 
                                            variant="body2" 
                                            className="text-gray-700 dark:text-gray-300"
                                            dangerouslySetInnerHTML={{ __html: item.comment }}
                                        />
                                    )}
                                </Paper>
                            );
                        } else {
                            // Log event thay đổi
                            return (
                                <Box key={item.id} className="pl-4 py-2 border-l-2 border-primary/30 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/10 rounded-r-md">
                                    <Box className="flex gap-2 items-center">
                                        <Typography variant="caption" className="font-semibold text-primary">
                                            {modifierName}
                                        </Typography>
                                        <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                                            {item.event}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" className="text-gray-400 pr-2">
                                        {formatDate(item.createDate, "dd/MM/yyyy HH:mm")}
                                    </Typography>
                                </Box>
                            );
                        }
                    })
                )}
            </Box>
        </Box>
    );
};

export default TaskHistorySection;

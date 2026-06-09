import axios from './HttpService';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/tasks';

export const pagingTasks = async (searchDto) => {
    const response = await axios.post(`${API_PATH}/paging`, searchDto || {});
    return response.data;
};

export const getTasksForKanban = async (searchDto) => {
    const response = await axios.post(`${API_PATH}/kanban`, searchDto || {});
    return response.data;
};

export const getMyTasks = async (searchDto) => {
    const response = await axios.post(`${API_PATH}/my-tasks`, searchDto || {});
    return response.data;
};

export const getTaskById = async (id) => {
    const response = await axios.get(`${API_PATH}/${id}`);
    return response.data;
};

export const saveTask = async (task) => {
    if (task.id) {
        const response = await axios.put(`${API_PATH}/${task.id}`, task);
        return response.data;
    } else {
        const response = await axios.post(API_PATH, task);
        return response.data;
    }
};

export const deleteTask = async (id) => {
    const response = await axios.delete(`${API_PATH}/${id}`);
    return response.data;
};

export const updateTaskStatus = async (id, statusId) => {
    const response = await axios.put(`${API_PATH}/${id}/status?statusId=${statusId}`);
    return response.data;
};

export const countTasksByStatus = async (projectId, searchDto) => {
    const response = await axios.post(`${API_PATH}/project/${projectId}/count-by-status`, searchDto || {});
    return response.data;
};

export const uploadTaskAttachment = async (taskId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_PATH}/${taskId}/attachments`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const getTaskHistory = async (taskId) => {
    const response = await axios.get(`${API_PATH}/${taskId}/history`);
    return response.data;
};

export const addTaskComment = async (taskId, commentText) => {
    const response = await axios.post(`${API_PATH}/${taskId}/comments`, { comment: commentText });
    return response.data;
};

export const updateTaskComment = async (commentId, commentText) => {
    const response = await axios.put(`${API_PATH}/comments/${commentId}`, { comment: commentText });
    return response.data;
};

export const deleteTaskComment = async (commentId) => {
    const response = await axios.delete(`${API_PATH}/comments/${commentId}`);
    return response.data;
};

export const uploadTaskAttachmentLink = async (taskId, attachmentInfo) => {
    const response = await axios.post(`${API_PATH}/${taskId}/attachments/link`, null, {
        params: {
            name: attachmentInfo.name,
            size: attachmentInfo.size,
            filePath: attachmentInfo.filePath
        }
    });
    return response.data;
};

export const deleteTaskAttachment = async (attachmentId) => {
    const response = await axios.delete(`${API_PATH}/attachments/${attachmentId}`);
    return response.data;
};

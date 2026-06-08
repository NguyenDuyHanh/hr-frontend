import axios from './HttpService';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/projects';

export const getProjects = async () => {
    const response = await axios.get(API_PATH);
    return response.data;
};

export const pagingProjects = async (searchDto) => {
    const response = await axios.post(`${API_PATH}/paging`, searchDto || {});
    return response.data;
};

export const getProjectById = async (id) => {
    const response = await axios.get(`${API_PATH}/${id}`);
    return response.data;
};

export const saveProject = async (project) => {
    if (project.id) {
        const response = await axios.put(`${API_PATH}/${project.id}`, project);
        return response.data;
    } else {
        const response = await axios.post(API_PATH, project);
        return response.data;
    }
};

export const deleteProject = async (id) => {
    const response = await axios.delete(`${API_PATH}/${id}`);
    return response.data;
};

export const finishProject = async (id) => {
    const response = await axios.put(`${API_PATH}/${id}/finish`);
    return response.data;
};

export const unfinishProject = async (id) => {
    const response = await axios.put(`${API_PATH}/${id}/unfinish`);
    return response.data;
};

// Members API
export const getProjectMembers = async (projectId) => {
    const response = await axios.get(`${API_PATH}/${projectId}/members`);
    return response.data;
};

export const addProjectMember = async (projectId, memberRequest) => {
    const response = await axios.post(`${API_PATH}/${projectId}/members`, memberRequest);
    return response.data;
};

export const removeProjectMember = async (projectId, memberId) => {
    const response = await axios.delete(`${API_PATH}/${projectId}/members/${memberId}`);
    return response.data;
};

export const updateProjectMemberRole = async (projectId, memberId, role) => {
    const response = await axios.put(`${API_PATH}/${projectId}/members/${memberId}/role?role=${role}`);
    return response.data;
};

// Activities API
export const getProjectActivities = async (projectId, keyword) => {
    const response = await axios.get(`${API_PATH}/${projectId}/activities`, {
        params: keyword ? { keyword } : {}
    });
    return response.data;
};

export const addProjectActivity = async (projectId, activityRequest) => {
    const response = await axios.post(`${API_PATH}/${projectId}/activities`, activityRequest);
    return response.data;
};

export const updateProjectActivity = async (projectId, activityId, activityRequest) => {
    const response = await axios.put(`${API_PATH}/${projectId}/activities/${activityId}`, activityRequest);
    return response.data;
};

export const deleteProjectActivity = async (projectId, activityId) => {
    const response = await axios.delete(`${API_PATH}/${projectId}/activities/${activityId}`);
    return response.data;
};

export const reorderProjectActivities = async (projectId, activityIds) => {
    const response = await axios.put(`${API_PATH}/${projectId}/activities/reorder`, activityIds);
    return response.data;
};

// Working Statuses API
export const getProjectWorkingStatuses = async (projectId, keyword) => {
    const response = await axios.get(`${API_PATH}/${projectId}/working-statuses`, {
        params: keyword ? { keyword } : {}
    });
    return response.data;
};

export const addProjectWorkingStatus = async (projectId, statusRequest) => {
    const response = await axios.post(`${API_PATH}/${projectId}/working-statuses`, statusRequest);
    return response.data;
};

export const updateProjectWorkingStatus = async (projectId, statusId, statusRequest) => {
    const response = await axios.put(`${API_PATH}/${projectId}/working-statuses/${statusId}`, statusRequest);
    return response.data;
};

export const deleteProjectWorkingStatus = async (projectId, statusId) => {
    const response = await axios.delete(`${API_PATH}/${projectId}/working-statuses/${statusId}`);
    return response.data;
};

export const reorderProjectWorkingStatuses = async (projectId, statusIds) => {
    const response = await axios.put(`${API_PATH}/${projectId}/working-statuses/reorder`, statusIds);
    return response.data;
};

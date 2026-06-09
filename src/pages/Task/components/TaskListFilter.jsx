import React from 'react';
import { Grid } from '@mui/material';
import { useFormikContext } from 'formik';
import AsyncAutocomplete from '../../../components/ui/AsyncAutocomplete';
import SelectInput from '../../../components/ui/SelectInput';
import { pagingProjects, getProjectStaffs, getProjectWorkingStatuses, getProjectActivities } from '../../../services/projectService';
import { TASK_PRIORITY_OPTIONS } from '../../../constants/taskConstants';

const projectSearchObject = {
    pageIndex: 1,
    pageSize: 100
};

const TaskListFilter = () => {
    const { values, setFieldValue } = useFormikContext();
    const projectId = values.projectId?.id || values.projectId;
    const prevProjectIdRef = React.useRef(projectId);

    React.useEffect(() => {
        if (projectId !== prevProjectIdRef.current) {
            setFieldValue('assigneeId', null);
            setFieldValue('followerId', null);
            setFieldValue('statusId', null);
            setFieldValue('activityId', null);
            prevProjectIdRef.current = projectId;
        }
    }, [projectId, setFieldValue]);

    const fetchProjectStaffsApi = React.useMemo(() => {
        return async (searchObj) => {
            const currentProjId = searchObj?.projectId;
            if (!currentProjId) {
                return { data: [] };
            }
            return getProjectStaffs(currentProjId);
        };
    }, []);

    const fetchProjectStatusesApi = React.useMemo(() => {
        return async (searchObj) => {
            const currentProjId = searchObj?.projectId;
            if (!currentProjId) {
                return { data: [] };
            }
            return getProjectWorkingStatuses(currentProjId);
        };
    }, []);

    const fetchProjectActivitiesApi = React.useMemo(() => {
        return async (searchObj) => {
            const currentProjId = searchObj?.projectId;
            if (!currentProjId) {
                return { data: [] };
            }
            return getProjectActivities(currentProjId);
        };
    }, []);

    const staffSearchObject = React.useMemo(() => ({ projectId }), [projectId]);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
                <AsyncAutocomplete
                    name="projectId"
                    label="Dự án"
                    api={pagingProjects}
                    searchObject={projectSearchObject}
                    placeholder="Chọn dự án..."
                    displayName="name"
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <AsyncAutocomplete
                    name="assigneeId"
                    label="Người phụ trách"
                    api={fetchProjectStaffsApi}
                    searchObject={staffSearchObject}
                    placeholder="Chọn người phụ trách..."
                    displayName="displayName"
                    disabled={!projectId}
                />
            </Grid>

            <Grid item xs={12} sm={4}>
                <AsyncAutocomplete
                    name="followerId"
                    label="Người theo dõi"
                    api={fetchProjectStaffsApi}
                    searchObject={staffSearchObject}
                    placeholder="Chọn người theo dõi..."
                    displayName="displayName"
                    disabled={!projectId}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <AsyncAutocomplete
                    name="statusId"
                    label="Trạng thái"
                    api={fetchProjectStatusesApi}
                    searchObject={staffSearchObject}
                    placeholder="Chọn trạng thái..."
                    displayName="name"
                    disabled={!projectId}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <AsyncAutocomplete
                    name="activityId"
                    label="Hoạt động"
                    api={fetchProjectActivitiesApi}
                    searchObject={staffSearchObject}
                    placeholder="Chọn hoạt động..."
                    displayName="name"
                    disabled={!projectId}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <SelectInput
                    name="priority"
                    label="Độ ưu tiên"
                    options={TASK_PRIORITY_OPTIONS}
                    keyValue="value"
                    displayvalue="label"
                />
            </Grid>
        </Grid>
    );
};

export default TaskListFilter;

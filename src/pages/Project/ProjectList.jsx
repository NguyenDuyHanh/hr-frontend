import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconButton, Paper, Chip, Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UndoIcon from '@mui/icons-material/Undo';

import Table from '../../components/ui/Table';
import ProjectForm from './components/ProjectForm';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import useProjectStore from '../../store/useProjectStore';
import ListToolbar from '../../components/ui/ListToolbar';
import FilterPanel from '../../components/ui/FilterPanel';
import SelectInput from '../../components/ui/SelectInput';
import { Formik } from 'formik';
import { formatDate } from '../../LocalFunction';
import { ROLES } from '../../constants/roles';
import useAuthStore from '../../store/useAuthStore';
import { useProjects, useDeleteProject, useCompleteProject, useUncompleteProject } from './api';

const ProjectList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const hasRole = useAuthStore((state) => state.hasRole);
    const canAdd = hasRole([ROLES.ADMIN, ROLES.HR_MANAGER]);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openFinishConfirm, setOpenFinishConfirm] = useState(false);
    const [openUnfinishConfirm, setOpenUnfinishConfirm] = useState(false);
    const [projectToFinish, setProjectToFinish] = useState(null);
    const [projectToUnfinish, setProjectToUnfinish] = useState(null);
    const [filterOpen, setFilterOpen] = useState(false);

    const { 
        page, 
        setPage, 
        pageSize, 
        setPageSize, 
        setOpenForm, 
        openForm, 
        setSelectedProject, 
        selectedProject,
        keyword,
        setKeyword,
        filters,
        setFilters,
        resetStore
    } = useProjectStore();

    // Query & Mutations
    const { data: projectData, isFetching } = useProjects({
        pageIndex: page,
        pageSize,
        keyword,
        ...filters
    });
    const deleteProjectMutation = useDeleteProject();
    const completeProjectMutation = useCompleteProject();
    const uncompleteProjectMutation = useUncompleteProject();

    const formikRef = useRef();
    const [searchDraft, setSearchDraft] = useState(keyword || '');

    useEffect(() => {
        setSearchDraft(keyword || '');
    }, [keyword]);

    useEffect(() => {
        return () => {
            resetStore();
        };
    }, []);

    const handleAdd = () => {
        setSelectedProject(null);
        setOpenForm(true);
    };

    const handleView = (proj) => {
        navigate(`/projects/${proj.id}/view`);
    };

    const handleEdit = (proj) => {
        navigate(`/projects/${proj.id}/edit`);
    };

    const handleDelete = (proj) => {
        setSelectedProject(proj);
        setOpenConfirm(true);
    };

    const confirmDelete = async () => {
        if (selectedProject?.id) {
            await deleteProjectMutation.mutateAsync(selectedProject.id);
            setSelectedProject(null);
            setOpenConfirm(false);
        }
    };

    const handleFinish = (proj) => {
        setProjectToFinish(proj);
        setOpenFinishConfirm(true);
    };

    const confirmFinish = async () => {
        if (projectToFinish?.id) {
            await completeProjectMutation.mutateAsync(projectToFinish.id);
            setProjectToFinish(null);
            setOpenFinishConfirm(false);
        }
    };

    const handleUnfinish = (proj) => {
        setProjectToUnfinish(proj);
        setOpenUnfinishConfirm(true);
    };

    const confirmUnfinish = async () => {
        if (projectToUnfinish?.id) {
            await uncompleteProjectMutation.mutateAsync(projectToUnfinish.id);
            setProjectToUnfinish(null);
            setOpenUnfinishConfirm(false);
        }
    };

    const handleSearch = () => {
        setKeyword(searchDraft);
    };

    const handleApplyFilters = () => {
        setKeyword(searchDraft);
        formikRef.current?.handleSubmit();
    };

    const handleReset = () => {
        setSearchDraft('');
        formikRef.current?.resetForm();
        setKeyword('');
        setFilters({});
    };

    const columns = [
        { 
            title: t('common.actions', 'Thao tác'), 
            field: 'actions',
            width: 160,
            align: 'center',
            render: (rowData) => {
                const isSystemManager = hasRole([ROLES.ADMIN, ROLES.HR_MANAGER]);
                const isProjectManager = rowData.staffs?.some(
                    (s) => s.staffId === user?.staffId && s.projectRole === 'MANAGER'
                );
                const canManageRow = isSystemManager || isProjectManager;

                return (
                    <div className="flex items-center justify-center">
                        <IconButton size="small" sx={{ color: '#1976d2' }} onClick={() => handleView(rowData)} title={t('common.view_detail', 'Xem chi tiết')}><VisibilityIcon fontSize="small" /></IconButton>
                        {canManageRow && (
                            <>
                                <IconButton size="small" sx={{ color: '#1976d2' }} onClick={() => handleEdit(rowData)} title={t('common.edit', 'Sửa')}><EditIcon fontSize="small" /></IconButton>
                                {!rowData.isFinished && (
                                    <IconButton size="small" sx={{ color: '#2e7d32' }} onClick={() => handleFinish(rowData)} title={t('project.finish_tooltip', 'Đánh dấu hoàn thành')}><CheckCircleIcon fontSize="small" /></IconButton>
                                )}
                                {rowData.isFinished && (
                                    <IconButton size="small" sx={{ color: '#ed6c02' }} onClick={() => handleUnfinish(rowData)} title={t('project.unfinish_tooltip', 'Bỏ hoàn thành')}><UndoIcon fontSize="small" /></IconButton>
                                )}
                                <IconButton size="small" sx={{ color: '#d32f2f' }} onClick={() => handleDelete(rowData)} title={t('common.delete', 'Xóa')}><DeleteIcon fontSize="small" /></IconButton>
                            </>
                        )}
                    </div>
                );
            }
        },
        { 
            title: t('project.code', 'Mã dự án'), 
            field: 'code', 
            width: 140,
            minWidth: 140,
            render: (rowData) => <span className="font-semibold">{rowData.code}</span>
        },
        { 
            title: t('project.name', 'Tên dự án'), 
            field: 'name',
            width: 200,
            minWidth: 200,
            render: (rowData) => <span className="font-semibold">{rowData.name}</span>
        },
        { 
            title: t('common.description', 'Mô tả'), 
            field: 'description',
            width: 300,
            minWidth: 300,
            render: (rowData) => <span className="line-clamp-2">{rowData.description || '---'}</span>
        },
        { 
            title: t('common.start_date', 'Ngày bắt đầu'), 
            field: 'startDate', 
            width: 130,
            align: 'center',
            render: (rowData) => <span>{formatDate(rowData.startDate) || '---'}</span>
        },
        { 
            title: t('common.end_date', 'Ngày kết thúc'), 
            field: 'endDate', 
            width: 130,
            align: 'center',
            render: (rowData) => <span>{formatDate(rowData.endDate) || '---'}</span>
        },
        { 
            title: t('common.status', 'Trạng thái'), 
            field: 'isFinished',
            width: 140,
            align: 'center',
            render: (rowData) => (
                <Chip 
                    label={rowData.isFinished ? t('project.status.finished', 'Hoàn thành') : t('project.status.in_progress', 'Đang thực hiện')} 
                    color={rowData.isFinished ? "success" : "warning"} 
                    size="small" 
                />
            )
        }
    ];

    return (
        <>
            <Paper elevation={0} className="p-4 border border-border">
                <Formik
                    innerRef={formikRef}
                    initialValues={{
                        isFinished: ''
                    }}
                    onSubmit={(values) => {
                        const statusFilter = {};
                        if (values.isFinished !== '') {
                            statusFilter.isFinished = values.isFinished === 'true';
                        }
                        setFilters(statusFilter);
                    }}
                >
                    {() => (
                        <>
                            <ListToolbar
                                searchDraft={searchDraft}
                                onSearchDraftChange={setSearchDraft}
                                onSearch={handleSearch}
                                onReset={handleReset}
                                onAdd={canAdd ? handleAdd : undefined}
                                addLabel={t('project.add_btn', 'Thêm dự án')}
                                searchPlaceholder={t('project.search_placeholder', 'Tìm kiếm theo tên dự án...')}
                                filter={{
                                    open: filterOpen,
                                    onToggle: setFilterOpen,
                                    activeCount: Object.keys(filters).length
                                }}
                            />

                            <FilterPanel
                                open={filterOpen}
                                onOpenChange={setFilterOpen}
                                onApply={handleApplyFilters}
                                onReset={handleReset}
                            >
                                 <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <SelectInput
                                            name="isFinished"
                                            label={t('project.filter.completion_status', 'Trạng thái hoàn thành')}
                                            options={[
                                                { value: '', name: t('common.all', 'Tất cả') },
                                                { value: 'false', name: t('project.status.in_progress', 'Đang thực hiện') },
                                                { value: 'true', name: t('project.status.finished', 'Đã hoàn thành') }
                                            ]}
                                            keyValue="value"
                                            displayvalue="name"
                                            hideNullOption={true}
                                        />
                                    </Grid>
                                </Grid>
                            </FilterPanel>
                        </>
                    )}
                </Formik>

                <Table 
                    columns={columns} 
                    data={projectData?.content || []} 
                    totalElements={projectData?.totalElements || 0}
                    page={page}
                    pageSize={pageSize}
                    handleChangePage={(e, p) => setPage(p)}
                    setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                    loading={isFetching}
                />
            </Paper>

            {openForm && (
                <ProjectForm 
                    open={openForm} 
                    onClose={() => setOpenForm(false)} 
                    projectData={selectedProject}
                    onSaveSuccess={() => {
                        setOpenForm(false);
                    }}
                />
            )}

            <ConfirmationDialog
                open={openConfirm}
                onConfirmDialogClose={() => setOpenConfirm(false)}
                onYesClick={confirmDelete}
                title={t('project.delete_confirm_title', 'Xác nhận xóa dự án')}
                text={t('project.delete_confirm_text', 'Bạn có chắc chắn muốn xóa dự án này? Thao tác này không thể hoàn tác.')}
                agree={t('common.confirm', 'Xác nhận')}
                cancel={t('common.cancel', 'Hủy bỏ')}
            />

            <ConfirmationDialog
                open={openFinishConfirm}
                onConfirmDialogClose={() => setOpenFinishConfirm(false)}
                onYesClick={confirmFinish}
                title={t('project.finish_confirm_title', 'Xác nhận hoàn thành dự án')}
                text={t('project.finish_confirm_text', 'Bạn có chắc chắn muốn đánh dấu dự án này là hoàn thành? Thao tác này không thể hoàn tác.')}
                agree={t('common.confirm', 'Xác nhận')}
                cancel={t('common.cancel', 'Hủy bỏ')}
            />

            <ConfirmationDialog
                open={openUnfinishConfirm}
                onConfirmDialogClose={() => setOpenUnfinishConfirm(false)}
                onYesClick={confirmUnfinish}
                title={t('project.unfinish_confirm_title', 'Bỏ đánh dấu hoàn thành')}
                text={t('project.unfinish_confirm_text', 'Bạn có chắc chắn muốn bỏ đánh dấu hoàn thành dự án này? Ngày kết thúc sẽ bị xóa.')}
                agree={t('common.confirm', 'Xác nhận')}
                cancel={t('common.cancel', 'Hủy bỏ')}
            />
        </>
    );
};

export default ProjectList;

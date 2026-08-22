import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    IconButton, 
    Paper, 
    Tooltip 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import Table from '../../components/ui/Table';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import ListToolbar from '../../components/ui/ListToolbar';
import RoleForm from './components/RoleForm';
import useRoleStore from '../../store/roleStore';
import { useRoles, useDeleteRole } from './api';

const RolePage = () => {
    const { t } = useTranslation();
    const {
        page,
        pageSize,
        keyword,
        setPage,
        setPageSize,
        setKeyword,
        setOpenForm,
        selectedRole,
        setSelectedRole,
        resetStore
    } = useRoleStore();

    // Query & Mutation
    const { data: roleData, isFetching } = useRoles({
        pageIndex: page,
        pageSize,
        keyword
    });
    const deleteRoleMutation = useDeleteRole();

    // Toolbar search draft
    const [searchDraft, setSearchDraft] = useState(keyword || '');
    
    // Delete confirm dialog state
    const [openConfirm, setOpenConfirm] = useState(false);

    useEffect(() => {
        setSearchDraft(keyword || '');
    }, [keyword]);

    useEffect(() => {
        return () => {
            resetStore();
        };
    }, []);

    const handleSearch = () => {
        setKeyword(searchDraft);
    };

    const handleReset = () => {
        setSearchDraft('');
        setKeyword('');
    };

    const handleOpenAdd = () => {
        setSelectedRole(null);
        setOpenForm(true);
    };

    const handleOpenEdit = (item) => {
        setSelectedRole(item);
        setOpenForm(true);
    };

    const handleOpenDelete = (item) => {
        setSelectedRole(item);
        setOpenConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedRole && selectedRole.id) {
            await deleteRoleMutation.mutateAsync(selectedRole.id);
            setOpenConfirm(false);
            setSelectedRole(null);
        }
    };

    const columns = [
        {
            title: t('common.actions', 'Thao tác'),
            align: 'center',
            width: '100px',
            render: (rowData) => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                    <Tooltip title={t('common.edit', 'Chỉnh sửa')} arrow>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(rowData)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.delete', 'Xóa')} arrow>
                        <IconButton size="small" color="error" onClick={() => handleOpenDelete(rowData)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            ),
        },
        { title: t('role.name', 'Tên vai trò'), field: 'name', align: 'left', width: '200px' },
        { title: t('role.description', 'Mô tả vai trò'), field: 'description', align: 'left' }
    ];

    return (
        <div className="space-y-4">
            <Paper elevation={0} className="py-4 px-2 md:px-4 border border-border">
                <ListToolbar
                    searchDraft={searchDraft}
                    onSearchDraftChange={setSearchDraft}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    onAdd={handleOpenAdd}
                    addLabel={t('role.add_btn', 'Thêm vai trò')}
                    searchPlaceholder={t('role.search_placeholder', 'Tìm kiếm vai trò theo tên hoặc mô tả...')}
                />

                <Table 
                    columns={columns} 
                    data={roleData?.content || []} 
                    totalElements={roleData?.totalElements || 0}
                    page={page}
                    pageSize={pageSize}
                    handleChangePage={(e, p) => setPage(p)}
                    setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                    loading={isFetching}
                />
            </Paper>

            {/* Add/Edit popup form component */}
            <RoleForm />

            {/* Delete Confirmation */}
            <ConfirmationDialog
                open={openConfirm}
                onConfirmDialogClose={() => {
                    setOpenConfirm(false);
                    setSelectedRole(null);
                }}
                onYesClick={handleConfirmDelete}
                title={t('role.delete_confirm_title', 'Xác nhận xóa vai trò')}
                text={t('role.delete_confirm_text', 'Bạn có chắc chắn muốn xóa vai trò "{{name}}" này không?', { name: selectedRole?.name })}
                agree={t('common.confirm', 'Xác nhận')}
                cancel={t('common.cancel', 'Hủy bỏ')}
            />
        </div>
    );
};

export default RolePage;

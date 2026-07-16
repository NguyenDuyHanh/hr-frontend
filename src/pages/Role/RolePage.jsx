import React, { useEffect, useState } from 'react';
import { 
    IconButton, 
    Paper, 
    Tooltip 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'sonner';

import Table from '../../components/ui/Table';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import ListToolbar from '../../components/ui/ListToolbar';
import RoleForm from './components/RoleForm';
import useRoleStore from '../../store/roleStore';

const RolePage = () => {
    const {
        roles,
        loading,
        totalElements,
        page,
        pageSize,
        keyword,
        setPage,
        setPageSize,
        setKeyword,
        setOpenForm,
        selectedRole,
        setSelectedRole,
        loadRoles,
        removeRole,
        resetStore
    } = useRoleStore();

    // Toolbar search draft
    const [searchDraft, setSearchDraft] = useState(keyword || '');
    
    // Delete confirm dialog state
    const [openConfirm, setOpenConfirm] = useState(false);

    useEffect(() => {
        setSearchDraft(keyword || '');
    }, [keyword]);

    useEffect(() => {
        loadRoles();
    }, [page, pageSize, keyword]);

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
            try {
                await removeRole(selectedRole.id);
                toast.success('Xóa vai trò thành công');
                setOpenConfirm(false);
                setSelectedRole(null);
            } catch (error) {
                console.error('Failed to delete role:', error);
                const errorMsg = error.response?.data?.message || 'Không thể xóa vai trò này. Vui lòng thử lại sau.';
                toast.error(errorMsg);
            }
        }
    };

    const columns = [
        {
            title: 'Thao tác',
            align: 'center',
            width: '100px',
            render: (rowData) => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                    <Tooltip title="Chỉnh sửa" arrow>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(rowData)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa" arrow>
                        <IconButton size="small" color="error" onClick={() => handleOpenDelete(rowData)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            ),
        },
        { title: 'Tên vai trò', field: 'name', align: 'left', width: '200px' },
        { title: 'Mô tả vai trò', field: 'description', align: 'left' }
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
                    addLabel="Thêm vai trò"
                    searchPlaceholder="Tìm kiếm vai trò theo tên hoặc mô tả..."
                />

                <Table 
                    columns={columns} 
                    data={roles} 
                    totalElements={totalElements}
                    page={page}
                    pageSize={pageSize}
                    handleChangePage={(e, p) => setPage(p)}
                    setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                    isLoading={loading}
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
                title="Xác nhận xóa vai trò"
                text={`Bạn có chắc chắn muốn xóa vai trò "${selectedRole?.name}" này không?`}
                agree="Xác nhận"
                cancel="Hủy bỏ"
            />
        </div>
    );
};

export default RolePage;

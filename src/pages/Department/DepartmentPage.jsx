import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    IconButton, 
    Paper, 
    Tooltip, 
    Box, 
    Typography,
    Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

import Table from '../../components/ui/Table';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import ListToolbar from '../../components/ui/ListToolbar';
import Popup from '../../components/ui/Popup';
import DepartmentForm from './components/DepartmentForm';
import useDepartmentStore from '../../store/departmentStore';
import { useDepartments, useDeleteDepartment, useDepartmentPositions } from './api';

const DepartmentPage = () => {
    const { t } = useTranslation();
    const {
        page,
        pageSize,
        keyword,
        setPage,
        setPageSize,
        setKeyword,
        setOpenForm,
        selectedDepartment,
        setSelectedDepartment,
        resetStore
    } = useDepartmentStore();

    // Query departments
    const { data: deptData, isFetching: isDeptFetching } = useDepartments({
        pageIndex: page,
        pageSize,
        keyword
    });
    const deleteDepartmentMutation = useDeleteDepartment();

    // Toolbar search draft
    const [searchDraft, setSearchDraft] = useState(keyword || '');
    
    // Delete confirm dialog state
    const [openConfirm, setOpenConfirm] = useState(false);

    // Position detail list dialog state
    const [openPositionsDialog, setOpenPositionsDialog] = useState(false);
    const [positionsPage, setPositionsPage] = useState(1);
    const [positionsPageSize, setPositionsPageSize] = useState(5);

    // Query positions belonging to selected department
    const { data: positionsData, isFetching: isPositionsFetching } = useDepartmentPositions(
        selectedDepartment?.id,
        { pageIndex: positionsPage, pageSize: positionsPageSize },
        openPositionsDialog
    );

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
        setSelectedDepartment(null);
        setOpenForm(true);
    };

    const handleOpenEdit = (item) => {
        setSelectedDepartment(item);
        setOpenForm(true);
    };

    const handleOpenDelete = (item) => {
        setSelectedDepartment(item);
        setOpenConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedDepartment && selectedDepartment.id) {
            await deleteDepartmentMutation.mutateAsync(selectedDepartment.id);
            setOpenConfirm(false);
            setSelectedDepartment(null);
        }
    };

    const handleOpenPositionsList = (item) => {
        setSelectedDepartment(item);
        setPositionsPage(1);
        setOpenPositionsDialog(true);
    };

    const columns = [
        {
            title: t('common.actions', 'Thao tác'),
            align: 'center',
            width: '100px',
            render: (rowData) => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                    <Tooltip title={t('department.list_positions_title', 'Danh sách vị trí')} arrow>
                        <IconButton size="small" color="info" onClick={() => handleOpenPositionsList(rowData)}>
                            <FormatListBulletedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
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
        { title: t('department.code', 'Mã phòng ban'), field: 'code', align: 'center', width: '150px' },
        { title: t('department.name', 'Tên phòng ban'), field: 'name', align: 'left' },
        { title: t('department.description', 'Mô tả'), field: 'description', align: 'left' }
    ];

    const positionColumns = [
        { title: t('department.position_code', 'Mã vị trí'), field: 'code', align: 'center', width: '120px' },
        { title: t('department.position_name', 'Tên vị trí/Chức danh'), field: 'name', align: 'left' },
        { title: t('department.position_description', 'Mô tả'), field: 'description', align: 'left' }
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
                    addLabel={t('department.add', 'Thêm phòng ban')}
                    searchPlaceholder={t('department.search_placeholder', 'Tìm kiếm phòng ban theo tên hoặc mã...')}
                />

                <Table 
                    columns={columns} 
                    data={deptData?.content || []} 
                    totalElements={deptData?.totalElements || 0}
                    page={page}
                    pageSize={pageSize}
                    handleChangePage={(e, p) => setPage(p)}
                    setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                    loading={isDeptFetching}
                />
            </Paper>

            {/* Add/Edit popup form component */}
            <DepartmentForm />

            {/* Delete Confirmation */}
            <ConfirmationDialog
                open={openConfirm}
                onConfirmDialogClose={() => {
                    setOpenConfirm(false);
                    setSelectedDepartment(null);
                }}
                onYesClick={handleConfirmDelete}
                title={t('department.delete_confirm_title', 'Xác nhận xóa phòng ban')}
                text={t('department.delete_confirm_text', { name: selectedDepartment?.name, code: selectedDepartment?.code }, `Bạn có chắc chắn muốn xóa phòng ban "${selectedDepartment?.name}" (${selectedDepartment?.code}) này không?`)}
                agree={t('common.confirm', 'Xác nhận')}
                cancel={t('common.cancel', 'Hủy bỏ')}
            />

            {/* List Positions of Department Dialog */}
            <Popup
                open={openPositionsDialog}
                onClosePopup={() => setOpenPositionsDialog(false)}
                title={t('department.positions_detail_title', { name: selectedDepartment?.name, code: selectedDepartment?.code }, `Danh sách vị trí - ${selectedDepartment?.name} (${selectedDepartment?.code})`)}
                size="md"
                action={
                    <Button onClick={() => setOpenPositionsDialog(false)} color="primary" variant="contained">
                        {t('common.close', 'Đóng')}
                    </Button>
                }
            >
                {(positionsData?.content || []).length === 0 && !isPositionsFetching ? (
                    <Box py={4} textAlign="center">
                        <Typography color="textSecondary" italic>
                            {t('department.empty_positions', 'Không có vị trí/chức danh nào thuộc phòng ban này.')}
                        </Typography>
                    </Box>
                ) : (
                    <Table
                        columns={positionColumns}
                        data={positionsData?.content || []}
                        totalElements={positionsData?.totalElements || 0}
                        page={positionsPage}
                        pageSize={positionsPageSize}
                        handleChangePage={(e, p) => setPositionsPage(p)}
                        setRowsPerPage={(e) => setPositionsPageSize(parseInt(e.target.value, 10))}
                        loading={isPositionsFetching}
                    />
                )}
            </Popup>
        </div>
    );
};

export default DepartmentPage;

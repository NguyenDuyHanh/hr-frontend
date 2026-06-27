import React, { useEffect, useState } from 'react';
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
import { toast } from 'sonner';

import Table from '../../components/ui/Table';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import ListToolbar from '../../components/ui/ListToolbar';
import Popup from '../../components/ui/Popup';
import DepartmentForm from './components/DepartmentForm';
import useDepartmentStore from '../../store/departmentStore';
import { pagingPositions } from '../../services/positionService';

const DepartmentPage = () => {
    const {
        departments,
        loading,
        totalElements,
        page,
        pageSize,
        keyword,
        setPage,
        setPageSize,
        setKeyword,
        setOpenForm,
        selectedDepartment,
        setSelectedDepartment,
        loadDepartments,
        removeDepartment,
        resetStore
    } = useDepartmentStore();

    // Toolbar search draft
    const [searchDraft, setSearchDraft] = useState(keyword || '');
    
    // Delete confirm dialog state
    const [openConfirm, setOpenConfirm] = useState(false);

    // Position detail list dialog state
    const [openPositionsDialog, setOpenPositionsDialog] = useState(false);
    const [positionsList, setPositionsList] = useState([]);
    const [positionsLoading, setPositionsLoading] = useState(false);
    const [positionsPage, setPositionsPage] = useState(1);
    const [positionsPageSize, setPositionsPageSize] = useState(5);
    const [positionsTotalElements, setPositionsTotalElements] = useState(0);

    useEffect(() => {
        setSearchDraft(keyword || '');
    }, [keyword]);

    useEffect(() => {
        loadDepartments();
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
            try {
                await removeDepartment(selectedDepartment.id);
                toast.success('Xóa phòng ban thành công');
                setOpenConfirm(false);
                setSelectedDepartment(null);
            } catch (error) {
                console.error('Failed to delete department:', error);
                const errorMsg = error.response?.data?.message || 'Không thể xóa phòng ban này. Vui lòng thử lại sau.';
                toast.error(errorMsg);
            }
        }
    };

    // Load Positions belonging to selected department
    const loadPositionsForDepartment = async (dept) => {
        try {
            setPositionsLoading(true);
            const searchDto = {
                pageIndex: positionsPage,
                pageSize: positionsPageSize,
                departmentId: dept.id
            };
            const response = await pagingPositions(searchDto);
            if (response && response.data) {
                setPositionsList(response.data.content || []);
                setPositionsTotalElements(response.data.totalElements || 0);
            }
        } catch (error) {
            console.error('Failed to load positions for department:', error);
            toast.error('Không thể tải danh sách vị trí thuộc phòng ban');
        } finally {
            setPositionsLoading(false);
        }
    };

    useEffect(() => {
        if (openPositionsDialog && selectedDepartment) {
            loadPositionsForDepartment(selectedDepartment);
        }
    }, [openPositionsDialog, selectedDepartment, positionsPage, positionsPageSize]);

    const handleOpenPositionsList = (item) => {
        setSelectedDepartment(item);
        setPositionsPage(1);
        setPositionsList([]);
        setPositionsTotalElements(0);
        setOpenPositionsDialog(true);
    };

    const columns = [
        {
            title: 'Thao tác',
            align: 'center',
            width: '100px',
            render: (rowData) => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                    <Tooltip title="Danh sách vị trí" arrow>
                        <IconButton size="small" color="info" onClick={() => handleOpenPositionsList(rowData)}>
                            <FormatListBulletedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
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
        { title: 'Mã phòng ban', field: 'code', align: 'center', width: '150px' },
        { title: 'Tên phòng ban', field: 'name', align: 'left' },
        { title: 'Mô tả', field: 'description', align: 'left' }
    ];

    const positionColumns = [
        { title: 'Mã vị trí', field: 'code', align: 'center', width: '120px' },
        { title: 'Tên vị trí/Chức danh', field: 'name', align: 'left' },
        { title: 'Mô tả', field: 'description', align: 'left' }
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
                    addLabel="Thêm phòng ban"
                    searchPlaceholder="Tìm kiếm phòng ban theo tên hoặc mã..."
                />

                <Table 
                    columns={columns} 
                    data={departments} 
                    totalElements={totalElements}
                    page={page}
                    pageSize={pageSize}
                    handleChangePage={(e, p) => setPage(p)}
                    setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                    isLoading={loading}
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
                title="Xác nhận xóa phòng ban"
                text={`Bạn có chắc chắn muốn xóa phòng ban "${selectedDepartment?.name}" (${selectedDepartment?.code}) này không?`}
                agree="Xác nhận"
                cancel="Hủy bỏ"
            />

            {/* List Positions of Department Dialog */}
            <Popup
                open={openPositionsDialog}
                onClosePopup={() => setOpenPositionsDialog(false)}
                title={`Danh sách vị trí - ${selectedDepartment?.name} (${selectedDepartment?.code})`}
                size="md"
                action={
                    <Button onClick={() => setOpenPositionsDialog(false)} color="primary" variant="contained">
                        Đóng
                    </Button>
                }
            >
                {positionsList.length === 0 && !positionsLoading ? (
                    <Box py={4} textAlign="center">
                        <Typography color="textSecondary" italic>
                            Không có vị trí/chức danh nào thuộc phòng ban này.
                        </Typography>
                    </Box>
                ) : (
                    <Table
                        columns={positionColumns}
                        data={positionsList}
                        totalElements={positionsTotalElements}
                        page={positionsPage}
                        pageSize={positionsPageSize}
                        handleChangePage={(e, p) => setPositionsPage(p)}
                        setRowsPerPage={(e) => setPositionsPageSize(parseInt(e.target.value, 10))}
                        isLoading={positionsLoading}
                    />
                )}
            </Popup>
        </div>
    );
};

export default DepartmentPage;

import React, { useEffect, useState } from 'react';
import { Button, Grid, IconButton, TextField, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import UiTable from '../../components/ui/UiTable';
import StaffForm from './StaffForm';
import UiConfirmationDialog from '../../components/ui/UiConfirmationDialog';
import useStaffStore from '../../store/staffStore';
import { WorkingStatusOptions } from '../../LocalConstants';
import { getLabelFromOptions } from '../../LocalFunction';

const StaffList = () => {
    const [openConfirm, setOpenConfirm] = useState(false);

    const { 
        staffs, 
        loadStaffs, 
        removeStaff, 
        page, 
        setPage, 
        pageSize, 
        setPageSize, 
        totalElements, 
        setOpenForm, 
        openForm, 
        setSelectedStaff, 
        selectedStaff,
    } = useStaffStore();

    useEffect(() => {
        loadStaffs();
    }, [page, pageSize]);

    const handleAdd = () => {
        setSelectedStaff(null);
        setOpenForm(true);
    };

    const handleEdit = (staff) => {
        setSelectedStaff(staff);
        setOpenForm(true);
    };

    const handleDelete = (staff) => {
        setSelectedStaff(staff);
        setOpenConfirm(true);
    };

    const confirmDelete = async () => {
        if (selectedStaff?.id) {
            await removeStaff(selectedStaff.id);
            setSelectedStaff(null);
            setOpenConfirm(false);
        }
    };

    const columns = [
        { 
            title: 'Thao tác', 
            field: 'actions',
            width: 140,
            render: (rowData) => (
                <div className="flex items-center space-x-0">
                    <IconButton size="small" sx={{ color: '#1976d2' }}><VisibilityIcon fontSize="small" /></IconButton>
                    <IconButton size="small" sx={{ color: '#1976d2' }} onClick={() => handleEdit(rowData)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" sx={{ color: '#d32f2f' }} onClick={() => handleDelete(rowData)}><DeleteIcon fontSize="small" /></IconButton>
                    <IconButton size="small"><MoreHorizIcon fontSize="small" /></IconButton>
                </div>
            )
        },
        { 
            title: 'Mã nhân viên', 
            field: 'staffCode', 
            width: 130,
        },
        { 
            title: 'Nhân viên', 
            field: 'displayName',
            width: 250,
            render: (rowData) => (
                <div className="py-1">
                    <div className="font-bold leading-tight whitespace-nowrap">{rowData.displayName}</div>
                    <div className="mt-1 whitespace-nowrap">Ngày sinh: {rowData.birthDate || '---'}</div>
                    <div className="whitespace-nowrap">Ngày vào làm: {rowData.startDate || '---'}</div>
                    <div>Giới tính: {rowData.gender || '---'}</div> 
                </div>
            )
        },
        { 
            title: 'Thông tin liên hệ', 
            width: 250,
            render: (rowData) => (
                <div className="py-1">
                    <div>SĐT: {rowData.phoneNumber || '---'}</div>
                    <div className="truncate max-w-[230px]">Email: {rowData.email || '---'}</div>
                </div>
            )
        },
        { 
            title: 'Trạng thái nhân viên', 
            field: 'workingStatus',
            width: 150,
            render: (rowData) => (
                <span>
                    {getLabelFromOptions(WorkingStatusOptions, rowData.workingStatus)}
                </span>
            )
        },
        { 
            title: 'Đơn vị', 
            width: 150,
            render: () => <span className="uppercase whitespace-nowrap">Thẩm mỹ Linh Anh</span> 
        },
        { 
            title: 'Phòng ban', 
            width: 180,
            render: (rowData) => <span className="text-[12px]">{rowData.department?.name || '---'}</span> 
        },
        { 
            title: 'Chức danh', 
            width: 180,
            render: (rowData) => <span className="text-[12px]">{rowData.position?.name || '---'}</span> 
        },
        { 
            title: 'Quản lý trực tiếp', 
            width: 200,
            render: (rowData) => (
                <div className="leading-tight">
                    - {rowData.managerName || 'Chưa xác định'}
                </div>
            )
        },
        { 
            title: 'Nơi ở hiện tại', 
            width: 250,
            render: (rowData) => <span className="leading-tight">{rowData.currentAddress || '---'}</span> 
        },
        { 
            title: 'Mã số BHXH', 
            field: 'socialInsuranceCode',
            width: 150,
            render: (rowData) => <span>{rowData.socialInsuranceCode || '---'}</span>
        },
        { 
            title: 'Trạng thái hồ sơ', 
            width: 150,
            render: () => <span className="text-[12px] text-green-600">---</span>
        },
        { 
            title: 'Tên đăng nhập', 
            width: 180,
            render: (rowData) => (
                <div className="flex items-center space-x-2">
                    <span>{rowData.username || '---'}</span>
                    {rowData.username && <span>✔</span>}
                </div>
            )
        },
        { 
            title: 'Cấp bậc', 
            field: 'level',
            width: 100,
            render: (rowData) => <span className="text-[12px] font-bold">{rowData.level || '---'}</span> 
        },
    ];

    return (
        <>
            <Paper elevation={0} className="p-4 border border-gray-200">
                {/* Toolbar buttons */}
                <div className="flex flex-wrap gap-2 mb-5">
                    <Button 
                        variant="contained" 
                        size="small" 
                        startIcon={<AddIcon />} 
                        onClick={handleAdd}
                        sx={{ textTransform: 'none' }}
                    >
                        Thêm mới
                    </Button>
                    <Button variant="contained" size="small" startIcon={<FileDownloadIcon />} sx={{ textTransform: 'none' }}>
                        Xuất Excel
                    </Button>
                    <Button variant="contained" size="small" startIcon={<FileUploadIcon />} sx={{ textTransform: 'none' }}>
                        Nhập Excel nhân viên cũ
                    </Button>
                    <Button variant="contained" size="small" startIcon={<FileUploadIcon />} sx={{ textTransform: 'none' }}>
                        Nhập Excel nhân viên mới
                    </Button>
                    <Button variant="contained" size="small" startIcon={<FileDownloadIcon />} sx={{ textTransform: 'none' }}>
                        Tải mẫu nhập
                    </Button>
                </div>

                {/* Search area */}
                <Grid container spacing={1} alignItems="center" className="mb-6">
                    <Grid item xs={12} sm={8} md={8}>
                        <TextField 
                            fullWidth
                            size="small"
                            placeholder="Tìm kiếm theo tên, mã nhân viên, email, số điện thoại..."
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4} md={4}>
                        <div className="flex gap-2">
                            <Button 
                                variant="contained" 
                                size="small" 
                                startIcon={<SearchIcon />} 
                                sx={{ textTransform: 'none', height: '32px', whiteSpace: 'nowrap' }}
                            >
                                Tìm kiếm
                            </Button>
                            <Button 
                                variant="outlined" 
                                size="small" 
                                startIcon={<FilterListIcon />} 
                                sx={{ textTransform: 'none', color: '#333', borderColor: '#ccc', height: '32px', whiteSpace: 'nowrap' }}
                            >
                                Bộ lọc
                            </Button>
                        </div>
                    </Grid>
                </Grid>

                {/* Table */}
                <UiTable 
                    columns={columns} 
                    data={staffs} 
                    totalElements={totalElements}
                    page={page}
                    pageSize={pageSize}
                    handleChangePage={(e, p) => setPage(p)}
                    setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                />
            </Paper>

            {openForm && (
                <StaffForm 
                    open={openForm} 
                    onClose={() => setOpenForm(false)} 
                    staffData={selectedStaff}
                    onSaveSuccess={() => {
                        setOpenForm(false);
                    }}
                />
            )}

            <UiConfirmationDialog
                open={openConfirm}
                onConfirmDialogClose={() => setOpenConfirm(false)}
                onYesClick={confirmDelete}
                title="Xác nhận xóa"
                text="Bạn có chắc chắn muốn xóa nhân viên này không? Hành động này không thể hoàn tác."
                agree="Xác nhận"
                cancel="Hủy bỏ"
            />
        </>
    );
};

export default StaffList;

import React, { useEffect, useState, useMemo } from 'react';
import { 
    Button, 
    Grid, 
    IconButton, 
    TextField, 
    Paper, 
    Collapse, 
    Tooltip,
    Box,
    Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';

import UiTable from '../../components/ui/UiTable';
import useUserStore from '../../store/userStore';
import UiConfirmationDialog from '../../components/ui/UiConfirmationDialog';
import UserForm from './UserForm';
import UiSelectInput from '../../components/ui/UiSelectInput';
import { Formik } from 'formik';
import { saveUser } from '../../services/UserService';
import { getDepartments, getPositions } from '../../services/StaffService';

const UserList = () => {
    const {
        users,
        roles,
        totalElements,
        page,
        setPage,
        pageSize,
        setPageSize,
        keyword,
        setKeyword,
        active,
        setActive,
        departmentId,
        setDepartmentId,
        positionId,
        setPositionId,
        roleId,
        setRoleId,
        selectedUser,
        setSelectedUser,
        openForm,
        setOpenForm,
        loadUsers,
        loadRoles,
        removeUser,
        resetFilters
    } = useUserStore();

    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openLockConfirm, setOpenLockConfirm] = useState(false);
    const [isView, setIsView] = useState(false);

    const activeOptions = useMemo(() => [
        { value: '', name: 'Tất cả' },
        { value: true, name: 'Hoạt động' },
        { value: false, name: 'Bị khóa' }
    ], []);

    const roleOptions = useMemo(() => [
        { id: '', name: 'Tất cả' },
        ...roles
    ], [roles]);

    const departmentOptions = useMemo(() => [
        { id: '', name: 'Tất cả' },
        ...departments
    ], [departments]);

    const positionOptions = useMemo(() => [
        { id: '', name: 'Tất cả' },
        ...positions
    ], [positions]);

    useEffect(() => {
        loadUsers();
    }, [page, pageSize]);

    const handleSearch = () => {
        if (page !== 1) {
            setPage(1);
        } else {
            loadUsers();
        }
    };

    const handleReset = () => {
        resetFilters();
        if (page === 1) {
            loadUsers();
        }
    };

    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                const [deptRes, posRes] = await Promise.all([
                    getDepartments(),
                    getPositions()
                ]);
                setDepartments(deptRes?.data || []);
                setPositions(posRes?.data || []);
                loadRoles();
            } catch (error) {
                console.error("Failed to load filter options", error);
            }
        };
        loadFilterOptions();
    }, []);

    const handleAdd = () => {
        setSelectedUser(null);
        setIsView(false);
        setOpenForm(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsView(false);
        setOpenForm(true);
    };

    const handleView = (user) => {
        setSelectedUser(user);
        setIsView(true);
        setOpenForm(true);
    };

    const handleDelete = (user) => {
        setSelectedUser(user);
        setOpenConfirm(true);
    };

    const confirmDelete = async () => {
        if (selectedUser?.id) {
            try {
                await removeUser(selectedUser.id);
                setSelectedUser(null);
                setOpenConfirm(false);
            } catch (error) {
                console.error('Error deleting user', error);
            }
        }
    };

    const handleToggleActive = (user) => {
        setSelectedUser(user);
        setOpenLockConfirm(true);
    };

    const confirmToggleActive = async () => {
        if (selectedUser) {
            const actionText = selectedUser.active ? 'khóa' : 'mở khóa';
            try {
                await saveUser({
                    ...selectedUser,
                    active: !selectedUser.active
                });
                setSelectedUser(null);
                setOpenLockConfirm(false);
                loadUsers();
            } catch (error) {
                console.error(`Lỗi khi ${actionText} tài khoản:`, error);
            }
        }
    };

    const columns = [
        {
            title: 'Thao tác',
            align: 'center',
            render: (rowData) => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                    <Tooltip title="Xem chi tiết" arrow>
                        <IconButton size="small" color="info" onClick={() => handleView(rowData)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Chỉnh sửa tài khoản" arrow>
                        <IconButton size="small" color="primary" onClick={() => handleEdit(rowData)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={rowData.active ? "Khóa tài khoản" : "Mở khóa tài khoản"} arrow>
                        <IconButton 
                            size="small" 
                            color={rowData.active ? "warning" : "success"} 
                            onClick={() => handleToggleActive(rowData)}
                        >
                            {rowData.active ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Xóa tài khoản" arrow>
                        <IconButton size="small" color="error" onClick={() => handleDelete(rowData)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            ),
        },
        { title: 'Tên tài khoản', field: 'username' },
        { title: 'Email', field: 'email' },
        { 
            title: 'Vai trò', 
            render: (rowData) => {
                if (rowData?.roles && Array.isArray(rowData.roles)) {
                    return rowData.roles.map(role => role.name).join(', ');
                }
                return '';
            }
        },
        { title: 'Nhân viên sử dụng', render: (rowData) => rowData.staffName || '' },
        { 
            title: 'Trạng thái', 
            align: 'center',
            render: (rowData) => (
                <Box display="flex" alignItems="center" justifyContent="center">
                    {rowData.active ? (
                        <Box px={1.5} py={0.5} borderRadius={4} bgcolor="#e8f5e9" color="#2e7d32" display="flex" alignItems="center" gap={0.5}>
                            <CheckCircleIcon fontSize="inherit" />
                            <Typography variant="caption" fontWeight="bold">Hoạt động</Typography>
                        </Box>
                    ) : (
                        <Box px={1.5} py={0.5} borderRadius={4} bgcolor="#ffebee" color="#c62828" display="flex" alignItems="center" gap={0.5}>
                            <CancelIcon fontSize="inherit" />
                            <Typography variant="caption" fontWeight="bold">Bị khóa</Typography>
                        </Box>
                    )}
                </Box>
            )
        },
    ];

    return (
        <div>
            <Paper elevation={0} className="py-4 px-2 md:px-4 border border-border">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <Box display="flex" gap={1}>
                        <Button 
                            size='small'
                            variant="contained" 
                            color="primary" 
                            startIcon={<AddIcon />} 
                            onClick={handleAdd}
                            sx={{ textTransform: 'none' }}
                        >
                            Thêm tài khoản
                        </Button>
                    </Box>
                </div>

                {/* Quick Search Area */}
                <Grid container spacing={1} alignItems="center" style={{ marginBottom: '24px' }}>
                    <Grid item xs={12} sm={8} md={8}>
                        <TextField 
                            fullWidth
                            size="small"
                            placeholder="Tìm kiếm tài khoản theo username, email, tên nhân viên hoặc mã nhân viên..."
                            variant="outlined"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4} md={4}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button 
                                variant="contained" 
                                color="primary"
                                size="small" 
                                startIcon={<SearchIcon />} 
                                style={{ height: '32px', whiteSpace: 'nowrap', textTransform: 'none' }}
                                onClick={handleSearch}
                            >
                                Tìm kiếm
                            </Button>
                            <Button 
                                variant="outlined" 
                                size="small" 
                                startIcon={
                                    <FilterListIcon 
                                        style={{ 
                                            transform: showFilter ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s ease-in-out'
                                        }} 
                                    />
                                } 
                                onClick={() => setShowFilter(!showFilter)}
                            >
                                Bộ lọc
                            </Button>
                        </div>
                    </Grid>
                </Grid>

                {/* Collapsible Filter Panel */}
                <Collapse in={showFilter}>
                    <Box mb={3}>
                        <Typography variant="subtitle2" fontWeight="bold" mb={2} color="textSecondary">
                            Bộ lọc tìm kiếm nâng cao
                        </Typography>
                        <Formik
                            initialValues={{
                                active: active === null ? '' : active,
                                roleId: roleId || '',
                                departmentId: departmentId || '',
                                positionId: positionId || '',
                            }}
                            enableReinitialize
                        >
                            {() => (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <UiSelectInput
                                            label="Trạng thái"
                                            name="active"
                                            options={activeOptions}
                                            keyValue="value"
                                            displayvalue="name"
                                            hideNullOption={true}
                                            onValueChange={(val) => {
                                                setActive(val === '' ? null : val);
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <UiSelectInput
                                            label="Vai trò (Quyền)"
                                            name="roleId"
                                            options={roleOptions}
                                            keyValue="id"
                                            displayvalue="name"
                                            hideNullOption={true}
                                            onValueChange={(val) => {
                                                setRoleId(val || null);
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <UiSelectInput
                                            label="Phòng ban"
                                            name="departmentId"
                                            options={departmentOptions}
                                            keyValue="id"
                                            displayvalue="name"
                                            hideNullOption={true}
                                            onValueChange={(val) => {
                                                setDepartmentId(val || null);
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <UiSelectInput
                                            label="Chức danh"
                                            name="positionId"
                                            options={positionOptions}
                                            keyValue="id"
                                            displayvalue="name"
                                            hideNullOption={true}
                                            onValueChange={(val) => {
                                                setPositionId(val || null);
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} display="flex" justifyContent="flex-end" gap={1} mt={1}>
                                        <Button 
                                            variant="contained" 
                                            color="primary"
                                            startIcon={<SearchIcon />}
                                            onClick={handleSearch}
                                            style={{ textTransform: 'none' }}
                                        >
                                            Tìm kiếm
                                        </Button>
                                        <Button 
                                            variant="outlined" 
                                            color="inherit" 
                                            startIcon={<RotateLeftIcon />} 
                                            onClick={handleReset}
                                            style={{ textTransform: 'none' }}
                                        >
                                            Đặt lại bộ lọc
                                        </Button>
                                    </Grid>
                                </Grid>
                            )}
                        </Formik>
                    </Box>
                </Collapse>
                
                <UiTable 
                    columns={columns} 
                    data={users} 
                    totalElements={totalElements}
                    page={page}
                    pageSize={pageSize}
                    handleChangePage={(e, p) => setPage(p)}
                    setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                />
            </Paper>

            {openForm && (
                <UserForm 
                    open={openForm} 
                    onClose={() => setOpenForm(false)} 
                    userData={selectedUser}
                    isView={isView}
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
                text="Bạn có chắc chắn muốn xóa tài khoản này không? Hành động này không thể hoàn tác."
                agree="Xác nhận"
                cancel="Hủy bỏ"
            />

            <UiConfirmationDialog
                open={openLockConfirm}
                onConfirmDialogClose={() => setOpenLockConfirm(false)}
                onYesClick={confirmToggleActive}
                title={selectedUser?.active ? "Xác nhận khóa tài khoản" : "Xác nhận mở khóa tài khoản"}
                text={selectedUser?.active 
                    ? `Bạn có chắc chắn muốn khóa tài khoản "${selectedUser?.username}" này không?` 
                    : `Bạn có chắc chắn muốn mở khóa tài khoản "${selectedUser?.username}" này không?`
                }
                agree="Xác nhận"
                cancel="Hủy bỏ"
            />
        </div>
    );
};

export default UserList;

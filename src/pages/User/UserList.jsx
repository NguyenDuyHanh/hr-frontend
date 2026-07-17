import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Grid, 
    IconButton, 
    Paper, 
    Tooltip,
    Box,
    Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

import Table from '../../components/ui/Table';
import useUserStore from '../../store/userStore';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import UserForm from './UserForm';
import ChangePasswordDialog from './ChangePasswordDialog';
import SelectInput from '../../components/ui/SelectInput';
import ListToolbar from '../../components/ui/ListToolbar';
import FilterPanel from '../../components/ui/FilterPanel';
import { Formik } from 'formik';
import { saveUser } from '../../services/UserService';
import { getDepartments, getPositions } from '../../services/StaffService';
import { getActiveFilterCount } from '../../LocalFunction';

const UserList = () => {
    const { t } = useTranslation();
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
        resetFilters,
        lockUserAccount,
        unlockUserAccount
    } = useUserStore();
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [filterOpen, setFilterOpen] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openLockConfirm, setOpenLockConfirm] = useState(false);
    const [openChangePassword, setOpenChangePassword] = useState(false);
    const [changePasswordUser, setChangePasswordUser] = useState(null);
    
    const formikRef = useRef();
    const [searchDraft, setSearchDraft] = useState(keyword || '');

    const activeOptions = useMemo(() => [
        { value: '', name: t('common.all', 'Tất cả') },
        { value: true, name: t('user.status.active', 'Hoạt động') },
        { value: false, name: t('user.status.locked', 'Bị khóa') }
    ], [t]);

    const roleOptions = useMemo(() => [
        { id: '', name: t('common.all', 'Tất cả') },
        ...roles
    ], [roles, t]);

    const departmentOptions = useMemo(() => [
        { id: '', name: t('common.all', 'Tất cả') },
        ...departments
    ], [departments, t]);

    const positionOptions = useMemo(() => [
        { id: '', name: t('common.all', 'Tất cả') },
        ...positions
    ], [positions, t]);

    useEffect(() => {
        setSearchDraft(keyword || '');
    }, [keyword]);

    useEffect(() => {
        loadUsers();
    }, [page, pageSize, keyword, active, departmentId, positionId, roleId]);

    const handleSearch = () => {
        setKeyword(searchDraft);
        if (filterOpen) {
            formikRef.current?.handleSubmit();
        }
    };

    const handleApplyFilters = () => {
        setKeyword(searchDraft);
        formikRef.current?.handleSubmit();
    };

    const handleReset = () => {
        setSearchDraft('');
        formikRef.current?.resetForm();
        resetFilters();
    };

    const activeFilterCount = useMemo(() => {
        return getActiveFilterCount({
            active,
            roleId,
            departmentId,
            positionId
        });
    }, [active, roleId, departmentId, positionId]);

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
        setOpenForm(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setOpenForm(true);
    };

    const handleChangePassword = (user) => {
        setChangePasswordUser(user);
        setOpenChangePassword(true);
    };

    const handleDelete = (user) => {
        setSelectedUser(user);
        setOpenConfirm(true);
    };

    const confirmDelete = async () => {
        if (selectedUser?.id) {
            await removeUser(selectedUser.id);
            setSelectedUser(null);
            setOpenConfirm(false);
        }
    };

    const handleToggleActive = (user) => {
        setSelectedUser(user);
        setOpenLockConfirm(true);
    };

    const confirmToggleActive = async () => {
        if (selectedUser) {
            if (selectedUser.active) {
                await lockUserAccount(selectedUser.id);
            } else {
                await unlockUserAccount(selectedUser.id);
            }
            setSelectedUser(null);
            setOpenLockConfirm(false);
        }
    };

    const columns = [
        {
            title: t('common.actions', 'Thao tác'),
            align: 'center',
            render: (rowData) => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                    <Tooltip title={t('user.change_password_tooltip', 'Đổi mật khẩu')} arrow>
                        <IconButton size="small" color="info" onClick={() => handleChangePassword(rowData)}>
                            <VpnKeyIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={t('user.edit_account_tooltip', 'Chỉnh sửa tài khoản')} arrow>
                        <IconButton size="small" color="primary" onClick={() => handleEdit(rowData)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={rowData.active ? t('user.lock_tooltip', 'Khóa tài khoản') : t('user.unlock_tooltip', 'Mở khóa tài khoản')} arrow>
                        <IconButton 
                            size="small" 
                            color={rowData.active ? "warning" : "success"} 
                            onClick={() => handleToggleActive(rowData)}
                        >
                            {rowData.active ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={t('user.delete_tooltip', 'Xóa tài khoản')} arrow>
                        <IconButton size="small" color="error" onClick={() => handleDelete(rowData)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            ),
        },
        { title: t('user.username', 'Tên tài khoản'), field: 'username', align: 'center' },
        { 
            title: t('user.roles', 'Vai trò'), 
            render: (rowData) => {
                if (rowData?.roles && Array.isArray(rowData.roles)) {
                    return rowData.roles.map(role => role.name).join(', ');
                }
                return '';
            }
        },
        { title: t('user.staff_name', 'Nhân viên sử dụng'), align: 'center', render: (rowData) => rowData.staffName || '' },
        { 
            title: t('common.status', 'Trạng thái'), 
            align: 'center',
            render: (rowData) => (
                <Box display="flex" alignItems="center" justifyContent="center">
                    {rowData.active ? (
                        <Box px={1.5} py={0.5} borderRadius={4} bgcolor="#e8f5e9" color="#2e7d32" display="flex" alignItems="center" gap={0.5}>
                            <CheckCircleIcon fontSize="inherit" />
                            <Typography variant="caption" fontWeight="bold">{t('user.status.active', 'Hoạt động')}</Typography>
                        </Box>
                    ) : (
                        <Box px={1.5} py={0.5} borderRadius={4} bgcolor="#ffebee" color="#c62828" display="flex" alignItems="center" gap={0.5}>
                            <CancelIcon fontSize="inherit" />
                            <Typography variant="caption" fontWeight="bold">{t('user.status.locked', 'Bị khóa')}</Typography>
                        </Box>
                    )}
                </Box>
            )
        },
    ];

    return (
        <div>
            <Paper elevation={0} className="py-4 px-2 md:px-4 border border-border">
                <Formik
                    innerRef={formikRef}
                    initialValues={{
                        active: active === null ? '' : active,
                        roleId: roleId || '',
                        departmentId: departmentId || '',
                        positionId: positionId || '',
                    }}
                    enableReinitialize
                    onSubmit={(values) => {
                        setActive(values.active === '' ? null : values.active);
                        setRoleId(values.roleId || null);
                        setDepartmentId(values.departmentId || null);
                        setPositionId(values.positionId || null);
                    }}
                >
                    {() => (
                        <>
                            <ListToolbar
                                searchDraft={searchDraft}
                                onSearchDraftChange={setSearchDraft}
                                onSearch={handleSearch}
                                onReset={handleReset}
                                onAdd={handleAdd}
                                addLabel={t('user.add_btn', 'Thêm tài khoản')}
                                searchPlaceholder={t('user.search_placeholder', 'Tìm kiếm tài khoản...')}
                                filter={{
                                    open: filterOpen,
                                    onToggle: setFilterOpen,
                                    activeCount: activeFilterCount
                                }}
                            />

                            <FilterPanel
                                open={filterOpen}
                                onOpenChange={setFilterOpen}
                                onApply={handleApplyFilters}
                                onReset={handleReset}
                            >
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <SelectInput
                                            label={t('common.status', 'Trạng thái')}
                                            name="active"
                                            options={activeOptions}
                                            keyValue="value"
                                            displayvalue="name"
                                            hideNullOption={true}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <SelectInput
                                            label={t('user.roles', 'Vai trò')}
                                            name="roleId"
                                            options={roleOptions}
                                            keyValue="id"
                                            displayvalue="name"
                                            hideNullOption={true}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <SelectInput
                                            label={t('department.name', 'Phòng ban')}
                                            name="departmentId"
                                            options={departmentOptions}
                                            keyValue="id"
                                            displayvalue="name"
                                            hideNullOption={true}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <SelectInput
                                            label={t('position.name', 'Chức danh')}
                                            name="positionId"
                                            options={positionOptions}
                                            keyValue="id"
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
                    onSaveSuccess={() => {
                        setOpenForm(false);
                    }}
                />
            )}

            {openChangePassword && changePasswordUser && (
                <ChangePasswordDialog
                    open={openChangePassword}
                    onClose={() => {
                        setOpenChangePassword(false);
                        setChangePasswordUser(null);
                    }}
                    user={changePasswordUser}
                />
            )}

            <ConfirmationDialog
                open={openConfirm}
                onConfirmDialogClose={() => setOpenConfirm(false)}
                onYesClick={confirmDelete}
                title={t('user.delete_confirm_title', 'Xác nhận xóa')}
                text={t('user.delete_confirm_text', 'Bạn có chắc chắn muốn xóa tài khoản này không? Hành động này không thể hoàn tác.')}
                agree={t('common.confirm', 'Xác nhận')}
                cancel={t('common.cancel', 'Hủy bỏ')}
            />

            <ConfirmationDialog
                open={openLockConfirm}
                onConfirmDialogClose={() => setOpenLockConfirm(false)}
                onYesClick={confirmToggleActive}
                title={selectedUser?.active ? t('user.lock_confirm_title', 'Xác nhận khóa tài khoản') : t('user.unlock_confirm_title', 'Xác nhận mở khóa tài khoản')}
                text={selectedUser?.active 
                    ? t('user.lock_confirm_text', 'Bạn có chắc chắn muốn khóa tài khoản "{{username}}" này không?', { username: selectedUser?.username })
                    : t('user.unlock_confirm_text', 'Bạn có chắc chắn muốn mở khóa tài khoản "{{username}}" này không?', { username: selectedUser?.username })
                }
                agree={t('common.confirm', 'Xác nhận')}
                cancel={t('common.cancel', 'Hủy bỏ')}
            />
        </div>
    );
};

export default UserList;

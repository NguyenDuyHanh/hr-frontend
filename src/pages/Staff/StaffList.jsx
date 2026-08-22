import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

import Table from '../../components/ui/Table';
import StaffForm from './components/StaffForm';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import useStaffStore from '../../store/staffStore';
import useAuthStore from '../../store/useAuthStore';
import { useStaffs, useDeleteStaff } from './api';
import { ROLES } from '../../constants/roles';
import { WorkingStatusOptions, GenderOptions } from '../../constants';
import { getLabelFromOptions, getActiveFilterCount, formatDate } from '../../LocalFunction';
import { getDepartments, getPositions, exportStaffExcel } from '../../services/StaffService';
import ListToolbar from '../../components/ui/ListToolbar';
import FilterPanel from '../../components/ui/FilterPanel';
import { Formik } from 'formik';
import Autocomplete from '../../components/ui/Autocomplete';
import SelectInput from '../../components/ui/SelectInput';

const FAKE_DEPARTMENTS = [
  { id: '1', name: "Phòng Hành chính" },
  { id: '2', name: "Phòng Kỹ thuật" },
  { id: '3', name: "Phòng Kinh doanh" },
  { id: '4', name: "Phòng Nhân sự" },
];

const FAKE_POSITIONS = [
  { id: '1', name: "Giám đốc" },
  { id: '2', name: "Trưởng phòng" },
  { id: '3', name: "Trưởng nhóm" },
  { id: '4', name: "Nhân viên" },
];

const StaffList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const hasRole = useAuthStore((state) => state.hasRole);
    const canManage = hasRole([ROLES.ADMIN, ROLES.HR_MANAGER]);
    const canDelete = hasRole([ROLES.ADMIN]);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [filterOpen, setFilterOpen] = useState(false);

    const { 
        page, 
        setPage, 
        pageSize, 
        setPageSize, 
        setOpenForm, 
        openForm, 
        setSelectedStaff, 
        selectedStaff,
        keyword,
        setKeyword,
        filters,
        setFilters,
    } = useStaffStore();

    const { data, isFetching } = useStaffs({ pageIndex: page, pageSize, keyword, ...filters });
    const deleteStaffMutation = useDeleteStaff();

    const formikRef = useRef();
    const [searchDraft, setSearchDraft] = useState(keyword || '');

    useEffect(() => {
        const fetchRefs = async () => {
            try {
                const depRes = await getDepartments();
                setDepartments(depRes?.data?.length ? depRes.data : FAKE_DEPARTMENTS);
                const posRes = await getPositions();
                setPositions(posRes?.data?.length ? posRes.data : FAKE_POSITIONS);
            } catch (err) {
                console.error("Failed to load filter metadata:", err);
                setDepartments(FAKE_DEPARTMENTS);
                setPositions(FAKE_POSITIONS);
            }
        };
        fetchRefs();
    }, []);

    useEffect(() => {
        setSearchDraft(keyword || '');
    }, [keyword]);

    const handleAdd = () => {
        setSelectedStaff(null);
        setOpenForm(true);
    };

    const handleView = (staff) => {
        navigate(`/staff/${staff.id}`, { state: { isView: true } });
    };

    const handleEdit = (staff) => {
        navigate(`/staff/${staff.id}`, { state: { isEdit: true } });
    };

    const handleDelete = (staff) => {
        setSelectedStaff(staff);
        setOpenConfirm(true);
    };

    const confirmDelete = async () => {
        if (selectedStaff?.id) {
            await deleteStaffMutation.mutateAsync(selectedStaff.id);
            setSelectedStaff(null);
            setOpenConfirm(false);
        }
    };

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
        setKeyword('');
        setFilters({});
    };

    const initialDepartment = useMemo(() => {
        return departments.find(d => d.id === filters.departmentId) || null;
    }, [departments, filters.departmentId]);

    const initialPosition = useMemo(() => {
        return positions.find(p => p.id === filters.positionId) || null;
    }, [positions, filters.positionId]);

    const activeFilterCount = useMemo(() => {
        return getActiveFilterCount(filters);
    }, [filters]);

    const importOpts = useMemo(() => [
        {
            label: t('staff.import_old', 'Nhập Excel nhân viên cũ'),
            onImport: async (file) => {
                console.log('Nhập Excel nhân viên cũ:', file);
            }
        },
        {
            label: t('staff.import_new', 'Nhập Excel nhân viên mới'),
            onImport: async (file) => {
                console.log('Nhập Excel nhân viên mới:', file);
            }
        }
    ], [t]);

    const templateOpts = useMemo(() => [
        {
            label: t('staff.download_template', 'Tải mẫu nhập'),
            fileName: 'mau_nhap_nhan_vien.xlsx',
            onDownload: async () => {
                return new Blob([""], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            }
        }
    ], [t]);

    const handleExport = async () => {
        const searchDto = {
            pageIndex: 1,
            pageSize: 10000,
            keyword: keyword || null,
            ...filters,
        };
        const blob = await exportStaffExcel(searchDto);
        return blob;
    };

    const columns = [
        { 
            title: t('common.actions', 'Thao tác'), 
            field: 'actions',
            align: 'center',
            width: 110,
            render: (rowData) => (
                <div className="flex items-center justify-center space-x-1">
                    <IconButton size="small" sx={{ color: '#1976d2' }} onClick={() => handleView(rowData)}>
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                    {canManage && (
                        <IconButton size="small" sx={{ color: '#1976d2' }} onClick={() => handleEdit(rowData)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    )}
                    {canDelete && (
                        <IconButton size="small" sx={{ color: '#d32f2f' }} onClick={() => handleDelete(rowData)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    )}
                </div>
            )
        },
        { 
            title: t('staff.code', 'Mã nhân viên'), 
            field: 'staffCode', 
            width: 120,
        },
        { 
            title: t('staff.fullName', 'Họ và tên'), 
            field: 'displayName',
            width: 160,
            render: (rowData) => <span className="font-bold">{rowData.displayName || '---'}</span>
        },
        { 
            title: t('staff.birthdate', 'Ngày sinh'), 
            field: 'birthDate',
            align: 'center',
            width: 120,
            render: (rowData) => formatDate(rowData.birthDate) || '---'
        },
        { 
            title: t('staff.start_date', 'Ngày vào làm'), 
            field: 'startDate',
            align: 'center',
            width: 120,
            render: (rowData) => formatDate(rowData.startDate) || '---'
        },
        { 
            title: t('staff.gender', 'Giới tính'), 
            field: 'gender',
            align: 'center',
            width: 100,
            render: (rowData) => t('staff.gender_value.' + rowData.gender, getLabelFromOptions(GenderOptions, rowData.gender) || '---')
        },
        { 
            title: t('staff.phone', 'SĐT'), 
            field: 'phoneNumber',
            width: 130,
            render: (rowData) => rowData.phoneNumber || '---'
        },
        { 
            title: t('staff.email', 'Email'), 
            field: 'email',
            width: 190,
            render: (rowData) => rowData.email || '---'
        },
        { 
            title: t('staff.department', 'Phòng ban'), 
            field: 'departmentName',
            width: 160,
            render: (rowData) => rowData.departmentName || '---' 
        },
        { 
            title: t('staff.position', 'Vị trí'), 
            field: 'positionName',
            width: 160,
            render: (rowData) => rowData.positionName || '---' 
        },
        { 
            title: t('staff.status', 'Trạng thái'), 
            field: 'workingStatus',
            align: 'center',
            width: 140,
            render: (rowData) => (
                <span>
                    {t('staff.status_value.' + rowData.workingStatus, getLabelFromOptions(WorkingStatusOptions, rowData.workingStatus))}
                </span>
            )
        },
    ];

    return (
        <>
            <Paper elevation={0} className="p-3 sm:p-4 border border-border">
                <Formik
                    innerRef={formikRef}
                    initialValues={{
                        department: initialDepartment,
                        position: initialPosition,
                        workingStatus: filters.workingStatus || ''
                    }}
                    enableReinitialize={true}
                    onSubmit={(values) => {
                        setFilters({
                            departmentId: values.department?.id || null,
                            positionId: values.position?.id || null,
                            workingStatus: values.workingStatus || null
                        });
                    }}
                >
                    {({ values, setFieldValue }) => (
                        <>
                            {/* Toolbar & Advanced Filter */}
                            <ListToolbar
                                searchDraft={searchDraft}
                                onSearchDraftChange={setSearchDraft}
                                onSearch={handleSearch}
                                onReset={handleReset}
                                onAdd={canManage ? handleAdd : undefined}
                                addLabel={t('staff.add', 'Thêm mới')}
                                searchPlaceholder={t('staff.search_placeholder', 'Tìm kiếm nhân viên...')}
                                filter={{
                                    open: filterOpen,
                                    onToggle: setFilterOpen,
                                    activeCount: activeFilterCount
                                }}
                                // downloadTemplateOptions={canManage ? templateOpts : undefined}
                                // importOptions={canManage ? importOpts : undefined}
                                onExport={canManage ? handleExport : undefined}
                                exportFileName="Danh_sach_nhan_vien.xlsx"
                            />

                            <FilterPanel
                                open={filterOpen}
                                onOpenChange={setFilterOpen}
                                onApply={handleApplyFilters}
                                onReset={handleReset}
                            >
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <Autocomplete
                                            name="department"
                                            label={t('staff.filter_department', 'Phòng ban')}
                                            options={departments}
                                            getOptionLabel={(option) => option?.name || ''}
                                            onChange={(event, val) => {
                                                setFieldValue('department', val);
                                                if (val && values.position) {
                                                    const posFull = positions.find(p => p.id === values.position.id);
                                                    if (posFull && posFull.department?.id !== val.id) {
                                                        setFieldValue('position', null);
                                                    }
                                                } else if (!val) {
                                                    setFieldValue('position', null);
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Autocomplete
                                            name="position"
                                            label={t('staff.filter_position', 'Vị trí')}
                                            options={
                                                values.department?.id
                                                    ? positions.filter(pos => pos.department?.id === values.department.id)
                                                    : positions
                                            }
                                            getOptionLabel={(option) => option?.name || ''}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <SelectInput
                                            name="workingStatus"
                                            label={t('staff.status', 'Trạng thái nhân viên')}
                                            options={[
                                                { value: '', name: t('common.all', 'Tất cả') },
                                                ...WorkingStatusOptions.map(opt => ({ value: opt.value, name: t('staff.status_value.' + opt.value, opt.name) }))
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

                {/* Table */}
                <Table 
                    columns={columns} 
                    data={data?.content || []} 
                    loading={isFetching}
                    totalElements={data?.totalElements || 0}
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
                />
            )}

            <ConfirmationDialog
                open={openConfirm}
                onConfirmDialogClose={() => setOpenConfirm(false)}
                onYesClick={confirmDelete}
                title={t('staff.delete_confirm_title', 'Xác nhận xóa')}
                text={t('staff.delete_confirm_text', 'Bạn có chắc chắn muốn xóa nhân viên này không? Hành động này không thể hoàn tác.')}
                agree={t('common.confirm', 'Xác nhận')}
                cancel={t('common.cancel', 'Hủy bỏ')}
            />
        </>
    );
};

export default StaffList;

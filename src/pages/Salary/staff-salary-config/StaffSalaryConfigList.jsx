import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Grid, IconButton, Tooltip, Stack, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Popup from '../../../components/ui/Popup';

import Table from '../../../components/ui/Table';
import ListToolbar from '../../../components/ui/ListToolbar';
import FilterPanel from '../../../components/ui/FilterPanel';
import { Formik } from 'formik';
import Autocomplete from '../../../components/ui/Autocomplete';
import SelectInput from '../../../components/ui/SelectInput';
import { useDepartmentsQuery } from '../../Department/api/queries';
import { usePositionsQuery } from '../../Position/api/queries';
import { pagingStaffs } from '../../../services/StaffService';
import { WorkingStatusOptions } from '../../../constants';
import { getLabelFromOptions } from '../../../LocalFunction';
import StaffSalaryConfigForm from './StaffSalaryConfigForm';

const StaffSalaryConfigList = () => {
    const { t } = useTranslation();
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [keyword, setKeyword] = useState('');
    const [filters, setFilters] = useState({});

    // TanStack Query for metadata
    const { data: departments = [] } = useDepartmentsQuery();
    const { data: positions = [] } = usePositionsQuery();

    const [filterOpen, setFilterOpen] = useState(false);
    const [searchDraft, setSearchDraft] = useState('');

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const formikRef = useRef();

    const loadStaffData = async () => {
        setLoading(true);
        try {
            const response = await pagingStaffs({
                pageIndex: page,
                pageSize,
                keyword,
                ...filters
            });
            setStaffs(response?.data?.content || []);
            setTotalElements(response?.data?.totalElements || 0);
        } catch (err) {
            console.error("Failed to load staff list for salary config:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStaffData();
    }, [page, pageSize, keyword, filters]);

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

    const handleOpenConfig = (staff) => {
        setSelectedStaff(staff);
        setDialogOpen(true);
    };

    const handleCloseConfig = () => {
        setSelectedStaff(null);
        setDialogOpen(false);
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.departmentId) count++;
        if (filters.positionId) count++;
        if (filters.workingStatus) count++;
        return count;
    }, [filters]);

    const columns = [
        {
            title: t('common.actions', 'Thao tác'),
            field: 'actions',
            width: 100,
            align: 'center',
            render: (rowData) => (
                <Tooltip title={t('salary.config.tooltip', 'Cấu hình lương & phụ cấp')} arrow>
                    <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleOpenConfig(rowData)}
                        className="bg-primary/10 hover:bg-primary/20 transition-colors"
                    >
                        <SettingsIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )
        },
        {
            title: t('staff.code', 'Mã nhân viên'),
            field: 'staffCode',
            width: 130,
        },
        {
            title: t('staff.name', 'Nhân viên'),
            field: 'displayName',
            align: 'center',
            width: 250,
            render: (rowData) => (
                <div className="py-1">
                    <span className="leading-tight block">{rowData.displayName}</span>
                </div>
            )
        },
        {
            title: t('department.name', 'Phòng ban'),
            field: 'departmentName',
            width: 180,
            render: (rowData) => <span>{rowData.departmentName || '---'}</span>
        },
        {
            title: t('position.name', 'Vị trí'),
            field: 'positionName',
            width: 180,
            render: (rowData) => <span>{rowData.positionName || '---'}</span>
        },
        {
            title: t('staff.status', 'Trạng thái nhân viên'),
            field: 'workingStatus',
            align: 'center',
            width: 150,
            render: (rowData) => (
                <span className="text-sm font-medium">
                    {rowData.workingStatus ? t('staff.status_label.' + rowData.workingStatus.toLowerCase(), getLabelFromOptions(WorkingStatusOptions, rowData.workingStatus)) : '---'}
                </span>
            )
        }
    ];

    return (
        <Box>
            {/* Main Content */}
            <Paper elevation={0} className="p-4 border border-border rounded-xl shadow-sm bg-card text-card-foreground">
                <Formik
                    innerRef={formikRef}
                    initialValues={{
                        department: null,
                        position: null,
                        workingStatus: ''
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
                            <ListToolbar
                                searchDraft={searchDraft}
                                onSearchDraftChange={setSearchDraft}
                                onSearch={handleSearch}
                                onReset={handleReset}
                                filter={{
                                    open: filterOpen,
                                    onToggle: setFilterOpen,
                                    activeCount: activeFilterCount
                                }}
                                searchPlaceholder={t('salary.config.search_placeholder', 'Tìm kiếm theo tên hoặc mã nhân viên...')}
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
                                            label={t('department.name', 'Phòng ban')}
                                            options={departments}
                                            getOptionLabel={(option) => option?.name || ''}
                                            onChange={(event, val) => {
                                                setFieldValue('department', val);
                                                setFieldValue('position', null);
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Autocomplete
                                            name="position"
                                            label={t('position.name', 'Vị trí')}
                                            options={
                                                values.department?.id
                                                    ? positions.filter(pos => pos.department?.id === values.department.id || pos.departmentId === values.department.id)
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
                                                ...WorkingStatusOptions.map(opt => ({ value: opt.value, name: t('staff.status_label.' + opt.value.toLowerCase(), opt.name) }))
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
                <Box className="mt-4">
                    <Table
                        columns={columns}
                        data={staffs}
                        totalElements={totalElements}
                        page={page}
                        pageSize={pageSize}
                        handleChangePage={(e, p) => setPage(p)}
                        handleChangeRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                        loading={loading}
                    />
                </Box>
            </Paper>

            {/* Configuration Popup */}
            <Popup
                open={dialogOpen}
                onClosePopup={handleCloseConfig}
                title={selectedStaff ? t('salary.config.popup_title', 'Cấu hình lương - {{name}} ({{code}})', { name: selectedStaff.displayName, code: selectedStaff.staffCode }) : t('salary.config.popup_title_default', 'Cấu hình lương & phụ cấp')}
                size="lg"
            >
                {selectedStaff && (
                    <StaffSalaryConfigForm 
                        staffId={selectedStaff.id} 
                        isView={false}
                    />
                )}
            </Popup>
        </Box>
    );
};

export default StaffSalaryConfigList;

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Box, Paper, Grid, IconButton, Tooltip, Stack, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Popup from '../../components/ui/Popup';

import Table from '../../components/ui/Table';
import ListToolbar from '../../components/ui/ListToolbar';
import FilterPanel from '../../components/ui/FilterPanel';
import { Formik } from 'formik';
import Autocomplete from '../../components/ui/Autocomplete';
import SelectInput from '../../components/ui/SelectInput';
import { getDepartments, getPositions, pagingStaffs } from '../../services/StaffService';
import { WorkingStatusOptions } from '../../constants';
import { getLabelFromOptions } from '../../LocalFunction';
import StaffSalaryConfigForm from '../Staff/components/StaffTabs/StaffSalaryConfigForm';

const StaffSalaryConfigList = () => {
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [keyword, setKeyword] = useState('');
    const [filters, setFilters] = useState({});

    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [filterOpen, setFilterOpen] = useState(false);
    const [searchDraft, setSearchDraft] = useState('');

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const formikRef = useRef();

    useEffect(() => {
        const fetchRefs = async () => {
            try {
                const depRes = await getDepartments();
                setDepartments(depRes?.data || []);
                const posRes = await getPositions();
                setPositions(posRes?.data || []);
            } catch (err) {
                console.error("Failed to load filter metadata:", err);
            }
        };
        fetchRefs();
    }, []);

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
            title: 'Thao tác',
            field: 'actions',
            width: 100,
            align: 'center',
            render: (rowData) => (
                <Tooltip title="Cấu hình lương & phụ cấp" arrow>
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
            title: 'Mã nhân viên',
            field: 'staffCode',
            width: 130,
        },
        {
            title: 'Nhân viên',
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
            title: 'Phòng ban',
            field: 'departmentName',
            width: 180,
            render: (rowData) => <span>{rowData.departmentName || '---'}</span>
        },
        {
            title: 'Vị trí',
            field: 'positionName',
            width: 180,
            render: (rowData) => <span>{rowData.positionName || '---'}</span>
        },
        {
            title: 'Trạng thái nhân viên',
            field: 'workingStatus',
            align: 'center',
            width: 150,
            render: (rowData) => (
                <span className="text-sm font-medium">
                    {getLabelFromOptions(WorkingStatusOptions, rowData.workingStatus)}
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
                                            label="Phòng ban"
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
                                            label="Vị trí"
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
                                            label="Trạng thái nhân viên"
                                            options={[
                                                { value: '', name: 'Tất cả' },
                                                ...WorkingStatusOptions.map(opt => ({ value: opt.value, name: opt.name }))
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
                title={selectedStaff ? `Cấu hình lương - ${selectedStaff.displayName} (${selectedStaff.staffCode})` : "Cấu hình lương & phụ cấp"}
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

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Paper, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';

import Table from '../../components/ui/Table';
import ListToolbar from '../../components/ui/ListToolbar';
import FilterPanel from '../../components/ui/FilterPanel';
import Autocomplete from '../../components/ui/Autocomplete';
import AsyncAutocomplete from '../../components/ui/AsyncAutocomplete';
import { getLeaveBalances } from '../../services/leaveService';
import { getDepartments, getPositions } from '../../services/StaffService';

const LeaveBalance = () => {
    const { t } = useTranslation();
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [keyword, setKeyword] = useState('');
    const [filters, setFilters] = useState({});
    const [filterOpen, setFilterOpen] = useState(false);
    const [searchDraft, setSearchDraft] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());

    const formikRef = useRef();

    const loadLeaveBalancesList = async () => {
        setLoading(true);
        try {
            const response = await getLeaveBalances({
                pageIndex: page,
                pageSize,
                keyword,
                ...filters
            }, year);
            setStaffs(response?.data?.content || []);
            setTotalElements(response?.data?.totalElements || 0);
        } catch (error) {
            console.error("Failed to load leave balances list", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaveBalancesList();
    }, [page, pageSize, keyword, filters, year]);

    const handleSearch = () => {
        setKeyword(searchDraft);
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

    const columns = useMemo(() => [
        {
            title: t('leave.field.staffCode', 'Mã nhân viên'),
            field: 'staffCode',
            align: 'center',
            width: 140,
            render: (rowData) => <span>{rowData.staffCode}</span>
        },
        {
            title: t('leave.field.staffName', 'Tên nhân viên'),
            field: 'staffName',
            width: 200,
            render: (rowData) => <span>{rowData.staffName}</span>
        },
        {
            title: t('leave.field.department', 'Phòng ban'),
            field: 'departmentName',
            width: 180,
            render: (rowData) => <span>{rowData.departmentName || '---'}</span>
        },
        {
            title: t('leave.field.position', 'Vị trí'),
            field: 'positionName',
            width: 160,
            render: (rowData) => <span>{rowData.positionName || '---'}</span>
        },
        {
            title: t('leave.balance.limit', 'Định mức phép năm'),
            field: 'annualLeave',
            width: 160,
            align: 'center',
            render: (rowData) => <span>{rowData.annualLeave}</span>
        },
        {
            title: t('leave.balance.used', 'Đã nghỉ (APPROVED)'),
            field: 'usedDays',
            width: 160,
            align: 'center',
            render: (rowData) => <span>{rowData.usedDays}</span>
        },
        {
            title: t('leave.balance.remaining', 'Còn lại'),
            field: 'remainingDays',
            width: 160,
            align: 'center',
            render: (rowData) => (
                <strong className="text-emerald-600">
                    {rowData.remainingDays}
                </strong>
            )
        }
    ], [t]);

    const activeFilterCount = useMemo(() => Object.keys(filters).filter(k => filters[k]).length, [filters]);

    return (
        <>
            <Paper elevation={0} className="p-4 border border-border">
                <Formik
                    innerRef={formikRef}
                    initialValues={{
                        department: null,
                        position: null
                    }}
                    onSubmit={(values) => {
                        const newFilters = {};
                        if (values.department?.id) newFilters.departmentId = values.department.id;
                        if (values.position?.id) newFilters.positionId = values.position.id;
                        setFilters(newFilters);
                    }}
                >
                    {({ setFieldValue }) => (
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
                                    <Grid item xs={12} sm={6}>
                                        <AsyncAutocomplete
                                            name="department"
                                            label={t('leave.field.department', 'Lọc theo phòng ban')}
                                            api={getDepartments}
                                            getOptionLabel={(option) => option?.name || ''}
                                            onChange={(event, val) => {
                                                setFieldValue('department', val);
                                                setFieldValue('position', null);
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <AsyncAutocomplete
                                            name="position"
                                            label={t('leave.field.position', 'Lọc theo vị trí')}
                                            api={getPositions}
                                            getOptionLabel={(option) => option?.name || ''}
                                        />
                                    </Grid>
                                </Grid>
                            </FilterPanel>
                        </>
                    )}
                </Formik>

                <Table
                    columns={columns}
                    data={staffs}
                    totalElements={totalElements}
                    page={page}
                    pageSize={pageSize}
                    handleChangePage={(e, p) => setPage(p)}
                    setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                    loading={loading}
                />
            </Paper>
        </>
    );
};

export default LeaveBalance;

import React, { useEffect, useState, useMemo } from 'react';
import { 
    IconButton, 
    Paper, 
    Tooltip, 
    Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'sonner';
import { useFormik, FormikProvider } from 'formik';

import Table from '../../components/ui/Table';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import ListToolbar from '../../components/ui/ListToolbar';
import FilterPanel from '../../components/ui/FilterPanel';
import SelectInput from '../../components/ui/SelectInput';
import PositionForm from './components/PositionForm';
import { getActiveFilterCount } from '../../LocalFunction';
import usePositionStore from '../../store/positionStore';
import { getAllDepartments } from '../../services/departmentService';

const PositionPage = () => {
    const {
        positions,
        loading,
        totalElements,
        page,
        pageSize,
        keyword,
        filters,
        setPage,
        setPageSize,
        setKeyword,
        setFilters,
        setOpenForm,
        selectedPosition,
        setSelectedPosition,
        loadPositions,
        removePosition,
        resetStore
    } = usePositionStore();

    const [departments, setDepartments] = useState([]);
    const [filterOpen, setFilterOpen] = useState(false);
    const [searchDraft, setSearchDraft] = useState(keyword || '');

    // Formik for filter panel
    const filterFormik = useFormik({
        initialValues: { departmentId: filters.departmentId || '' },
        enableReinitialize: true,
        onSubmit: (values) => {
            setFilters({ departmentId: values.departmentId || null });
        },
    });

    const activeFilterCount = useMemo(() => {
        return getActiveFilterCount({
            departmentId: filters.departmentId || ''
        });
    }, [filters.departmentId]);

    const loadDepts = async () => {
        try {
            const response = await getAllDepartments();
            if (response && response.data) {
                setDepartments(response.data || []);
            }
        } catch (error) {
            console.error('Failed to load departments list for filter dropdown:', error);
        }
    };

    useEffect(() => {
        loadDepts();
    }, []);

    useEffect(() => {
        setSearchDraft(keyword || '');
    }, [keyword]);

    useEffect(() => {
        loadPositions();
    }, [page, pageSize, keyword, filters]);

    useEffect(() => {
        return () => {
            resetStore();
        };
    }, []);

    const handleSearch = () => {
        setKeyword(searchDraft);
        if (filterOpen) {
            filterFormik.handleSubmit();
        }
    };

    const handleApplyFilters = () => {
        setKeyword(searchDraft);
        filterFormik.handleSubmit();
    };

    const handleReset = () => {
        setSearchDraft('');
        setKeyword('');
        setFilters({});
        filterFormik.resetForm({ values: { departmentId: '' } });
    };

    const handleOpenAdd = () => {
        setSelectedPosition(null);
        setOpenForm(true);
    };

    const handleOpenEdit = (item) => {
        setSelectedPosition(item);
        setOpenForm(true);
    };

    const handleOpenDelete = (item) => {
        setSelectedPosition(item);
        setOpenConfirm(true);
    };

    // Delete confirmation dialog state
    const [openConfirm, setOpenConfirm] = useState(false);

    const handleConfirmDelete = async () => {
        if (selectedPosition && selectedPosition.id) {
            try {
                await removePosition(selectedPosition.id);
                toast.success('Xóa vị trí thành công');
                setOpenConfirm(false);
                setSelectedPosition(null);
            } catch (error) {
                console.error('Failed to delete position:', error);
                const errorMsg = error.response?.data?.message || 'Không thể xóa vị trí này. Vui lòng thử lại sau.';
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
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
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
        { title: 'Mã vị trí', field: 'code', align: 'center', width: '150px' },
        { title: 'Tên vị trí/Chức danh', field: 'name', align: 'left' },
        { title: 'Phòng ban trực thuộc', field: 'departmentName', align: 'left' },
        { title: 'Mô tả', field: 'description', align: 'left' }
    ];

    const deptOptions = useMemo(() => {
        return departments.map(d => ({
            value: d.id,
            name: `${d.name} (${d.code})`
        }));
    }, [departments]);

    return (
        <div className="space-y-4">
            <Paper elevation={0} className="py-4 px-2 md:px-4 border border-border">
                <FormikProvider value={filterFormik}>
                    <ListToolbar
                        searchDraft={searchDraft}
                        onSearchDraftChange={setSearchDraft}
                        onSearch={handleSearch}
                        onReset={handleReset}
                        onAdd={handleOpenAdd}
                        addLabel="Thêm vị trí"
                        searchPlaceholder="Tìm kiếm vị trí theo tên hoặc mã..."
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
                            <Grid item xs={12} sm={6} md={4}>
                                <SelectInput
                                    label="Lọc theo phòng ban"
                                    name="departmentId"
                                    options={deptOptions}
                                    keyValue="value"
                                    displayvalue="name"
                                />
                            </Grid>
                        </Grid>
                    </FilterPanel>
                </FormikProvider>

                <Table 
                    columns={columns} 
                    data={positions} 
                    totalElements={totalElements}
                    page={page}
                    pageSize={pageSize}
                    handleChangePage={(e, p) => setPage(p)}
                    setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                    isLoading={loading}
                />
            </Paper>

            {/* Add/Edit popup form component */}
            <PositionForm />

            {/* Delete Confirmation */}
            <ConfirmationDialog
                open={openConfirm}
                onConfirmDialogClose={() => {
                    setOpenConfirm(false);
                    setSelectedPosition(null);
                }}
                onYesClick={handleConfirmDelete}
                title="Xác nhận xóa vị trí"
                text={`Bạn có chắc chắn muốn xóa vị trí "${selectedPosition?.name}" (${selectedPosition?.code}) này không?`}
                agree="Xác nhận"
                cancel="Hủy bỏ"
            />
        </div>
    );
};

export default PositionPage;

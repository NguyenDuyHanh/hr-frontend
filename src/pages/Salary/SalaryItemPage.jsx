import React, { useEffect, useState, useMemo } from 'react';
import { 
    Grid, 
    IconButton, 
    Paper, 
    Tooltip, 
    Box, 
    Typography,
    Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'sonner';
import { useFormik, FormikProvider } from 'formik';

import Table from '../../components/ui/Table';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import ListToolbar from '../../components/ui/ListToolbar';
import FilterPanel from '../../components/ui/FilterPanel';
import SelectInput from '../../components/ui/SelectInput';
import TextField from '../../components/ui/TextField';
import Popup from '../../components/ui/Popup';
import { getActiveFilterCount } from '../../LocalFunction';
import { getAllSalaryItems, saveSalaryItem, deleteSalaryItem } from '../../services/salaryItemService';
import { 
    SalaryItemType, 
    SalaryCalculationType, 
    SalaryItemTypeOptions, 
    SalaryItemTypeFormOptions, 
    SalaryCalculationTypeOptions, 
    SalaryCalculationTypeFormOptions 
} from '../../constants';

const SalaryItemPage = () => {
    const [items, setItems] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // Pagination, Search & Filters
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchDraft, setSearchDraft] = useState('');

    const [filterOpen, setFilterOpen] = useState(false);
    const [filterType, setFilterType] = useState('');
    const [filterCalculationType, setFilterCalculationType] = useState('');

    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [saving, setSaving] = useState(false);

    const activeFilterCount = useMemo(() => {
        return getActiveFilterCount({
            type: filterType,
            calculationType: filterCalculationType
        });
    }, [filterType, filterCalculationType]);

    const loadItems = async () => {
        try {
            setLoading(true);
            const response = await getAllSalaryItems();
            if (response && response.data) {
                const dataList = response.data.data || response.data || [];
                const filtered = dataList.filter(item => {
                    const matchesKeyword = item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                        item.code.toLowerCase().includes(searchKeyword.toLowerCase());
                    const matchesType = !filterType || item.type === filterType;
                    const matchesCalculationType = !filterCalculationType || item.calculationType === filterCalculationType;
                    return matchesKeyword && matchesType && matchesCalculationType;
                });
                setItems(filtered);
                setTotalElements(filtered.length);
            }
        } catch (error) {
            console.error('Failed to load salary items:', error);
            toast.error('Không thể tải danh sách khoản lương');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, [searchKeyword, filterType, filterCalculationType]);

    const handleSearch = () => {
        setSearchKeyword(searchDraft);
        if (filterOpen) {
            filterFormik.handleSubmit();
        }
    };

    const handleApplyFilters = () => {
        setSearchKeyword(searchDraft);
        filterFormik.handleSubmit();
    };

    const handleReset = () => {
        setSearchDraft('');
        setSearchKeyword('');
        filterFormik.resetForm({ values: { type: '', calculationType: '' } });
        setFilterType('');
        setFilterCalculationType('');
    };

    const handleOpenAdd = () => {
        setSelectedItem(null);
        formik.resetForm({
            values: {
                name: '',
                code: '',
                type: SalaryItemType.INCOME,
                calculationType: SalaryCalculationType.FIXED,
                description: ''
            }
        });
        setOpenDialog(true);
    };

    const handleOpenEdit = (item) => {
        setSelectedItem(item);
        formik.resetForm({
            values: {
                name: item.name || '',
                code: item.code || '',
                type: item.type || SalaryItemType.INCOME,
                calculationType: item.calculationType || SalaryCalculationType.FIXED,
                description: item.description || ''
            }
        });
        setOpenDialog(true);
    };

    const handleOpenDelete = (item) => {
        setSelectedItem(item);
        setOpenConfirm(true);
    };

    const handleSave = async (values) => {
        const payload = {
            id: selectedItem ? selectedItem.id : null,
            name: values.name,
            code: values.code.toUpperCase().trim(),
            calculationType: values.calculationType,
            type: values.type,
            description: values.description
        };

        try {
            setSaving(true);
            const response = await saveSalaryItem(payload);
            if (response && response.data) {
                toast.success(selectedItem ? 'Cập nhật khoản lương thành công' : 'Thêm khoản lương mới thành công');
                setOpenDialog(false);
                loadItems();
            }
        } catch (error) {
            console.error('Failed to save salary item:', error);
            toast.error('Lỗi khi lưu thông tin khoản lương');
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (selectedItem && selectedItem.id) {
            try {
                await deleteSalaryItem(selectedItem.id);
                toast.success('Xóa khoản lương thành công');
                setOpenConfirm(false);
                loadItems();
            } catch (error) {
                console.error('Failed to delete salary item:', error);
                toast.error('Không thể xóa khoản lương này. Có thể nó đang được sử dụng ở nơi khác.');
            }
        }
    };

    const calculationTypeLabels = {
        [SalaryCalculationType.FIXED]: 'Cố định',
        [SalaryCalculationType.BY_STANDARD_DAYS]: 'Theo công chuẩn',
        [SalaryCalculationType.DAILY_MULTIPLIED]: 'Theo công thực tế'
    };

    const columns = [
        {
            title: 'Thao tác',
            align: 'center',
            width: '1%',
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
        { title: 'Tên khoản lương', field: 'name', align: 'center' },
        { title: 'Mã khoản lương', field: 'code', align: 'center', render: (row) => <span>{row.code}</span> },
        { 
            title: 'Loại khoản lương', 
            align: 'center',
            field: 'type', 
            render: (row) => (
                <span>{row.type === SalaryItemType.INCOME ? 'Cộng (Thu nhập)' : 'Trừ (Khấu trừ)'}</span>
            )
        },
        { 
            title: 'Cách tính', 
            field: 'calculationType',
            align: 'center',
            render: (row) => calculationTypeLabels[row.calculationType] || 'Cố định'
        },
        { title: 'Mô tả', field: 'description', align: 'center' }
    ];

    // Client-side pagination
    const paginatedItems = items.slice(page * pageSize, (page + 1) * pageSize);

    // Form initial values
    const formInitialValues = {
        name: selectedItem?.name || '',
        code: selectedItem?.code || '',
        type: selectedItem?.type || SalaryItemType.INCOME,
        calculationType: selectedItem?.calculationType || SalaryCalculationType.FIXED,
        description: selectedItem?.description || '',
    };

    // Formik for filter panel
    const filterFormik = useFormik({
        initialValues: { type: filterType, calculationType: filterCalculationType },
        enableReinitialize: true,
        onSubmit: (values) => {
            setFilterType(values.type);
            setFilterCalculationType(values.calculationType);
        },
    });

    // Formik for Add/Edit popup
    const formik = useFormik({
        initialValues: formInitialValues,
        enableReinitialize: true,
        onSubmit: handleSave,
    });

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
                        addLabel="Thêm khoản lương"
                        searchPlaceholder="Tìm kiếm khoản lương theo tên hoặc mã..."
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
                                <SelectInput
                                    label="Loại khoản lương"
                                    name="type"
                                    options={SalaryItemTypeOptions}
                                    keyValue="value"
                                    displayvalue="name"
                                    hideNullOption={true}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <SelectInput
                                    label="Cách tính giá trị"
                                    name="calculationType"
                                    options={SalaryCalculationTypeOptions}
                                    keyValue="value"
                                    displayvalue="name"
                                    hideNullOption={true}
                                />
                            </Grid>
                        </Grid>
                    </FilterPanel>
                </FormikProvider>

                <Table 
                    columns={columns} 
                    data={paginatedItems} 
                    totalElements={totalElements}
                    page={page}
                    pageSize={pageSize}
                    handleChangePage={(e, p) => setPage(p)}
                    setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                />
            </Paper>

            {/* Add/Edit Popup */}
            <Popup
                open={openDialog}
                onClosePopup={() => setOpenDialog(false)}
                title={selectedItem ? 'Cập nhật Khoản lương' : 'Thêm Khoản lương mới'}
                size="sm"
                action={
                    <>
                        <Button onClick={() => setOpenDialog(false)} color="inherit" disabled={saving}>
                            Hủy bỏ
                        </Button>
                        <Button
                            onClick={formik.handleSubmit}
                            color="primary"
                            variant="contained"
                            disabled={saving}
                        >
                            {saving ? 'Đang lưu...' : 'Lưu lại'}
                        </Button>
                    </>
                }
            >
                <FormikProvider value={formik}>
                    <Grid container spacing={0}>
                        <Grid item xs={12}>
                            <TextField
                                label="Tên khoản lương"
                                name="name"
                                required
                                placeholder="Ví dụ: Lương cơ bản, Phụ cấp ăn trưa..."
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Mã khoản lương (Dùng trong công thức)"
                                name="code"
                                required
                                placeholder="Ví dụ: LCB, AN_TRUA, PC_DT"
                                disabled={selectedItem !== null}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <SelectInput
                                label="Loại khoản lương"
                                name="type"
                                options={SalaryItemTypeFormOptions}
                                keyValue="value"
                                displayvalue="name"
                                hideNullOption={true}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <SelectInput
                                label="Cách tính giá trị"
                                name="calculationType"
                                options={SalaryCalculationTypeFormOptions}
                                keyValue="value"
                                displayvalue="name"
                                hideNullOption={true}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Mô tả"
                                name="description"
                                placeholder="Nhập mô tả hoặc ghi chú của khoản lương..."
                                multiline
                                rows={2}
                            />
                        </Grid>
                    </Grid>
                </FormikProvider>
            </Popup>

            {/* Delete Confirmation */}
            <ConfirmationDialog
                open={openConfirm}
                onConfirmDialogClose={() => setOpenConfirm(false)}
                onYesClick={handleConfirmDelete}
                title="Xác nhận xóa khoản lương"
                text={`Bạn có chắc chắn muốn xóa khoản lương "${selectedItem?.name}" (${selectedItem?.code}) này không?`}
                agree="Xác nhận"
                cancel="Hủy bỏ"
            />
        </div>
    );
};

export default SalaryItemPage;

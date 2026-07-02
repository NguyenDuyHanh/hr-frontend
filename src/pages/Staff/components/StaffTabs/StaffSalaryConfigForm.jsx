import React, { useEffect, useState, useMemo } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Paper, 
    IconButton, 
    Grid,
    Tooltip,
    Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from 'sonner';
import { useFormik, FormikProvider } from 'formik';

// Common Components
import Table from '../../../../components/ui/Table';
import SelectInput from '../../../../components/ui/SelectInput';
import VNDCurrencyInput from '../../../../components/ui/VNDCurrencyInput';

import { getAllSalaryItems, getStaffSalaryItems, saveStaffSalaryItems } from '../../../../services/salaryItemService';
import { SalaryItemType, SalaryCalculationType } from '../../../../constants';

const StaffSalaryConfigForm = ({ staffId, isView }) => {
    const [allSalaryItems, setAllSalaryItems] = useState([]);
    const [configuredItems, setConfiguredItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        if (!staffId || staffId === 'new') return;
        try {
            setLoading(true);
            const [allItemsRes, configRes] = await Promise.all([
                getAllSalaryItems(),
                getStaffSalaryItems(staffId)
            ]);

            if (allItemsRes && allItemsRes.data) {
                setAllSalaryItems(allItemsRes.data.data || allItemsRes.data || []);
            }
            if (configRes && configRes.data) {
                setConfiguredItems(configRes.data.data || configRes.data || []);
            }
        } catch (error) {
            console.error('Failed to load staff salary config:', error);
            toast.error('Không thể tải cấu hình lương nhân viên');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [staffId]);

    const handleSaveConfig = async (values) => {
        if (!staffId || staffId === 'new') {
            toast.error('Vui lòng lưu thông tin nhân viên trước khi cấu hình lương');
            return;
        }

        try {
            const response = await saveStaffSalaryItems(staffId, values.configuredItems);
            if (response && response.data) {
                toast.success('Lưu cấu hình lương nhân viên thành công');
                loadData();
            }
        } catch (error) {
            console.error('Failed to save staff salary configuration:', error);
            toast.error('Lỗi khi lưu cấu hình lương nhân viên');
        }
    };

    // Formik Setup
    const formik = useFormik({
        initialValues: {
            selectedItemId: '',
            amount: '',
            configuredItems: configuredItems
        },
        enableReinitialize: true,
        onSubmit: handleSaveConfig
    });

    const handleAddItem = () => {
        const { selectedItemId, amount, configuredItems: currentConfigured } = formik.values;

        if (!selectedItemId) {
            toast.warning('Vui lòng chọn một khoản lương');
            return;
        }
        if (!amount || isNaN(amount) || parseFloat(amount) < 0) {
            toast.warning('Vui lòng nhập số tiền hợp lệ (>= 0)');
            return;
        }

        // Check duplicates
        const exists = currentConfigured.some(item => item.salaryItem?.id === selectedItemId);
        if (exists) {
            toast.warning('Khoản lương này đã được cấu hình cho nhân viên');
            return;
        }

        const selectedItem = allSalaryItems.find(item => item.id === selectedItemId);
        const newItem = {
            salaryItem: selectedItem,
            amount: parseFloat(amount)
        };

        const updated = [...currentConfigured, newItem];
        setConfiguredItems(updated);
        formik.setFieldValue('configuredItems', updated);
        formik.setFieldValue('selectedItemId', '');
        formik.setFieldValue('amount', '');
    };

    const handleRemoveItem = (index) => {
        const updated = [...formik.values.configuredItems];
        updated.splice(index, 1);
        setConfiguredItems(updated);
        formik.setFieldValue('configuredItems', updated);
    };

    // Filter available items for dropdown to avoid duplicates
    const availableItems = useMemo(() => {
        return allSalaryItems.filter(
            item => !formik.values.configuredItems.some(config => config.salaryItem?.id === item.id)
        );
    }, [allSalaryItems, formik.values.configuredItems]);

    // Format options for SelectInput
    const availableItemsOptions = useMemo(() => {
        return availableItems.map(item => ({
            id: item.id,
            displayName: `${item.name} (${item.code}) - ${item.type === SalaryItemType.INCOME ? 'Thu nhập' : 'Giảm trừ'}`
        }));
    }, [availableItems]);

    const formatMoney = (val) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    // Columns configuration for Table component
    const columns = useMemo(() => [
        { 
            title: 'Khoản lương', 
            field: 'salaryItem.name',
            render: (rowData) => <span className="font-semibold">{rowData.salaryItem?.name}</span>
        },
        { 
            title: 'Mã', 
            field: 'salaryItem.code',
            render: (row) => <span className="font-mono text-accent font-bold">{row.salaryItem?.code}</span>
        },
        { 
            title: 'Loại', 
            field: 'salaryItem.type', 
            render: (row) => (
                row.salaryItem?.type === SalaryItemType.INCOME ? (
                    <span className="text-emerald-700 font-bold">Thu nhập</span>
                ) : (
                    <span className="text-rose-700 font-bold">Giảm trừ</span>
                )
            )
        },
        { 
            title: 'Cách tính', 
            field: 'salaryItem.calculationType',
            render: (row) => (
                row.salaryItem?.calculationType === SalaryCalculationType.FIXED ? 'Cố định' : 
                row.salaryItem?.calculationType === SalaryCalculationType.BY_STANDARD_DAYS ? 'Theo công chuẩn' : 'Nhân trực tiếp công'
            )
        },
        { 
            title: 'Số tiền gán', 
            field: 'amount', 
            align: 'right', 
            width: 220,
            render: (row) => {
                const index = formik.values.configuredItems.findIndex(item => item.salaryItem?.id === row.salaryItem?.id);
                return isView ? (
                    <Typography variant="body2" fontWeight="bold">
                        {formatMoney(row.amount)}
                    </Typography>
                ) : (
                    <VNDCurrencyInput
                        name={`configuredItems[${index}].amount`}
                        placeholder="Số tiền..."
                        textAlignRight={true}
                        notDelay={true}
                        size="small"
                        noMargin={true}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            formik.setFieldValue(`configuredItems[${index}].amount`, val);
                            const updated = [...configuredItems];
                            if (updated[index]) {
                                updated[index].amount = val;
                                setConfiguredItems(updated);
                            }
                        }}
                    />
                );
            }
        },
        ...(!isView ? [{
            title: 'Thao tác',
            align: 'center',
            width: 80,
            render: (rowData) => {
                const index = formik.values.configuredItems.findIndex(item => item.salaryItem?.id === rowData.salaryItem?.id);
                return (
                    <Tooltip title="Gỡ bỏ khoản lương này" arrow>
                        <IconButton color="error" size="small" onClick={() => handleRemoveItem(index)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                );
            }
        }] : [])
    ], [formik.values.configuredItems, isView, configuredItems]);

    if (staffId === 'new') {
        return (
            <Box p={4} textAlign="center" className="text-text-secondary">
                <Typography variant="body1" className="italic">
                    Vui lòng lưu thông tin cá nhân của nhân viên trước khi cấu hình các khoản lương & phụ cấp.
                </Typography>
            </Box>
        );
    }

    return (
        <FormikProvider value={formik}>
            <Box className="space-y-6">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h6" fontWeight="bold">Cấu hình Lương & Phụ cấp</Typography>
                    </Box>
                    {!isView && (
                        <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={<SaveIcon />}
                            onClick={formik.handleSubmit}
                        >
                            Lưu cấu hình
                        </Button>
                    )}
                </Box>

                <Divider />

                {/* Add section */}
                {!isView && (
                    <Paper variant="outlined" className="p-4 bg-warm/5 border border-border">
                        <Grid container spacing={2} alignItems="flex-start" pt={2}>
                            <Grid item xs={12} sm={5}>
                                <SelectInput
                                    name="selectedItemId"
                                    label="Chọn khoản lương"
                                    options={availableItemsOptions}
                                    keyValue="id"
                                    displayvalue="displayName"
                                    hideNullOption={true}
                                />
                            </Grid>
                            <Grid item xs={12} sm={5}>
                                <VNDCurrencyInput
                                    name="amount"
                                    label="Số tiền (VND / tháng hoặc công)"
                                    placeholder="Ví dụ: 10000000"
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <label className="hidden sm:block text-sm font-semibold mb-1.5 select-none opacity-0">
                                    &nbsp;
                                </label>
                                <Button 
                                    variant="outlined" 
                                    color="primary" 
                                    startIcon={<AddIcon />}
                                    onClick={handleAddItem}
                                    fullWidth
                                    sx={{ height: '40px' }}
                                >
                                    Thêm gán
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                {/* Configuration list table */}
                <Table 
                    columns={columns} 
                    data={formik.values.configuredItems} 
                    totalElements={formik.values.configuredItems.length}
                    page={1}
                    pageSize={formik.values.configuredItems.length || 10}
                    handleChangePage={() => {}}
                    setRowsPerPage={() => {}}
                    nonePagination={true}
                    showIndex={true}
                />
            </Box>
        </FormikProvider>
    );
};

export default StaffSalaryConfigForm;

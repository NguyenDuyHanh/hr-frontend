import React, { useEffect, useState, useMemo } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    IconButton, 
    Tooltip,
    Divider,
    TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from 'sonner';
import { useFormik, FormikProvider } from 'formik';

// Common Components
import Table from '../../../../components/ui/Table';
import Autocomplete from '../../../../components/ui/Autocomplete';
import VNDCurrencyInput from '../../../../components/ui/VNDCurrencyInput';

import { getAllSalaryItems, getStaffSalaryItems, saveStaffSalaryItems } from '../../../../services/salaryItemService';
import { SalaryItemType, SalaryCalculationType } from '../../../../constants';
import { NumericFormat } from 'react-number-format';

const NumericFormatCustom = React.forwardRef((props, ref) => {
    const { onChange, ...other } = props;
    return (
        <NumericFormat
            {...other}
            getInputRef={ref}
            onValueChange={(values) => {
                onChange({
                    target: {
                        name: props.name,
                        value: values.value,
                    },
                });
            }}
            thousandSeparator
            valueIsNumericString
        />
    );
});

const InlineAmountInput = ({ value, onChange, disabled }) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <TextField
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={() => {
                const numVal = parseFloat(localValue) || 0;
                onChange(numVal);
            }}
            size="small"
            fullWidth
            disabled={disabled}
            InputProps={{
                inputComponent: NumericFormatCustom,
                endAdornment: (
                    <span style={{ marginRight: '8px', color: '#757575', whiteSpace: 'nowrap' }}>₫</span>
                )
            }}
            sx={{
                "& .MuiOutlinedInput-input": {
                    textAlign: "right",
                    fontSize: "14px",
                },
                "& .MuiOutlinedInput-root": {
                    backgroundColor: disabled ? "rgba(0, 0, 0, 0.05)" : "inherit",
                }
            }}
        />
    );
};

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
                const configItems = configRes.data.data || configRes.data || [];
                setConfiguredItems(configItems.map(item => ({
                    ...item,
                    isNew: false
                })));
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

        const hasInvalidRow = values.configuredItems.some(item => !item.salaryItem?.id);
        if (hasInvalidRow) {
            toast.error('Vui lòng chọn khoản lương cho tất cả các dòng trước khi lưu');
            return;
        }

        const itemsToSave = values.configuredItems.map(item => ({
            salaryItem: { id: item.salaryItem.id },
            amount: parseFloat(item.amount) || 0
        }));

        try {
            const response = await saveStaffSalaryItems(staffId, itemsToSave);
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
            configuredItems: configuredItems
        },
        enableReinitialize: true,
        onSubmit: handleSaveConfig
    });

    const getRowIndex = (row) => {
        return formik.values.configuredItems.findIndex(item => {
            if (row.salaryItem?.id && item.salaryItem?.id) {
                return item.salaryItem.id === row.salaryItem.id;
            }
            if (row.tempId && item.tempId) {
                return item.tempId === row.tempId;
            }
            return item === row;
        });
    };

    const handleAddItem = () => {
        const newItem = {
            tempId: Date.now() + Math.random(),
            salaryItem: null,
            amount: '',
            isNew: true
        };

        const updated = [...formik.values.configuredItems, newItem];
        setConfiguredItems(updated);
        formik.setFieldValue('configuredItems', updated);
    };

    const handleRemoveItem = (index) => {
        const updated = [...formik.values.configuredItems];
        updated.splice(index, 1);
        setConfiguredItems(updated);
        formik.setFieldValue('configuredItems', updated);
    };

    const formatMoney = (val) => {
        if (val === '' || val === null || val === undefined) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    // Columns configuration for Table component
    const columns = useMemo(() => [
        { 
            title: 'Khoản lương', 
            field: 'salaryItem.name',
            cellStyle: { verticalAlign: 'middle' },
            render: (row) => {
                const index = getRowIndex(row);
                const isNewRow = row.isNew === true;
                
                if (isView || !isNewRow) {
                    return <span>{row.salaryItem?.name}</span>;
                }
                
                const cellAvailableItems = allSalaryItems.filter(item => 
                    !formik.values.configuredItems.some((config, idx) => 
                        idx !== index && config.salaryItem?.id === item.id
                    )
                );
                
                return (
                    <Autocomplete
                        name={`configuredItems[${index}].salaryItem`}
                        options={cellAvailableItems}
                        displayData="name"
                        placeholder="Chọn khoản lương..."
                        noMargin={true}
                        onChange={(_, newValue) => {
                            const idx = getRowIndex(row);
                            if (idx !== -1) {
                                formik.setFieldValue(`configuredItems[${idx}].salaryItem`, newValue);
                                
                                const updated = [...configuredItems];
                                if (updated[idx]) {
                                    updated[idx].salaryItem = newValue;
                                    setConfiguredItems(updated);
                                }
                            }
                        }}
                    />
                );
            }
        },
        { 
            title: 'Mã', 
            align: 'center',
            field: 'salaryItem.code',
            cellStyle: { verticalAlign: 'middle' },
            render: (row) => {
                if (row.salaryItem?.code) {
                    return <span>{row.salaryItem.code}</span>;
                }
                return <span className="text-gray-400 italic">--</span>;
            }
        },
        { 
            title: 'Loại', 
            align: 'center',
            field: 'salaryItem.type', 
            cellStyle: { verticalAlign: 'middle' },
            render: (row) => {
                if (!row.salaryItem?.type) return <span className="text-gray-400 italic">--</span>;
                return row.salaryItem.type === SalaryItemType.INCOME ? (
                    <span>Thu nhập</span>
                ) : (
                    <span>Giảm trừ</span>
                );
            }
        },
        { 
            title: 'Cách tính', 
            align: 'center',
            field: 'salaryItem.calculationType',
            cellStyle: { verticalAlign: 'middle' },
            render: (row) => {
                if (!row.salaryItem?.calculationType) return <span className="text-gray-400 italic">--</span>;
                return row.salaryItem.calculationType === SalaryCalculationType.FIXED ? 'Cố định' : 
                       row.salaryItem.calculationType === SalaryCalculationType.BY_STANDARD_DAYS ? 'Theo công chuẩn' : 'Nhân trực tiếp công';
            }
        },
        { 
            title: 'Số tiền', 
            field: 'amount', 
            align: 'right', 
            width: 200,
            cellStyle: { verticalAlign: 'middle' },
            render: (row) => {
                const index = formik.values.configuredItems.findIndex(item => item.salaryItem?.id === row.salaryItem?.id);
                const disabled = !row.salaryItem?.id;
                return isView ? (
                    <Typography variant="body2">
                        {formatMoney(row.amount)}
                    </Typography>
                ) : (
                    <InlineAmountInput
                        value={row.amount}
                        disabled={disabled}
                        onChange={(val) => {
                            formik.setFieldValue(`configuredItems[${index}].amount`, val);
                        }}
                    />
                );
            }
        },
        ...(!isView ? [{
            title: 'Thao tác',
            align: 'center',
            width: 80,
            cellStyle: { verticalAlign: 'middle' },
            render: (row) => {
                return (
                    <Tooltip title="Gỡ bỏ khoản lương này" arrow>
                        <IconButton 
                            color="error" 
                            size="small" 
                            onClick={() => {
                                const index = getRowIndex(row);
                                if (index !== -1) {
                                    handleRemoveItem(index);
                                }
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                );
            }
        }] : [])
    ], [formik.values.configuredItems, isView, configuredItems, allSalaryItems]);

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
            <Box className="space-y-4" pb={4}>
                {!isView && (
                    <Box display="flex" justifyContent="end" alignItems="center">
                        <Box className="flex gap-2">
                            <Button 
                                variant="outlined" 
                                color="primary" 
                                startIcon={<AddIcon />}
                                onClick={handleAddItem}
                            >
                                Thêm dòng
                            </Button>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                startIcon={<SaveIcon />}
                                onClick={formik.handleSubmit}
                            >
                                Lưu cấu hình
                            </Button>
                        </Box>
                    </Box>
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

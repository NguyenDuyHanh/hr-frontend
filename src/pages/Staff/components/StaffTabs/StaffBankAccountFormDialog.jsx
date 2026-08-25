import React, { useMemo, useEffect, useState } from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Grid, FormControlLabel, Checkbox } from '@mui/material';
import Popup from '../../../../components/ui/Popup';
import TextField from '../../../../components/ui/TextField';
import Autocomplete from '../../../../components/ui/Autocomplete';
import { getAllBanks } from '../../../../services/bankService';

const StaffBankAccountFormDialog = ({ open, onClose, bankAccountData, staffDisplayName, onSave }) => {
    const [banks, setBanks] = useState([]);
    const isEdit = !!bankAccountData?.id;

    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const res = await getAllBanks();
                setBanks(res?.data || res || []);
            } catch (err) {
                console.error("Failed to load banks:", err);
            }
        };
        fetchBanks();
    }, []);

    const initialValues = useMemo(() => ({
        id: bankAccountData?.id || null,
        staffId: bankAccountData?.staffId || null,
        bank: bankAccountData?.bankId ? { id: bankAccountData.bankId, name: bankAccountData.bankName, bin: bankAccountData.bankBin } : null,
        accountNumber: bankAccountData?.accountNumber || '',
        accountName: (bankAccountData?.accountName || staffDisplayName || '').toUpperCase(),
        branchName: bankAccountData?.branchName || '',
        isDefault: bankAccountData?.isDefault !== undefined ? bankAccountData.isDefault : true,
        note: bankAccountData?.note || ''
    }), [bankAccountData, staffDisplayName]);

    const validationSchema = Yup.object({
        bank: Yup.object().required('Ngân hàng là bắt buộc').nullable(),
        accountNumber: Yup.string().required('Số tài khoản là bắt buộc'),
        accountName: Yup.string().required('Tên chủ tài khoản là bắt buộc'),
    });

    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: (values) => {
            const submitValues = {
                ...values,
                bankId: values.bank?.id || null,
                bank: undefined
            };
            onSave(submitValues);
            onClose();
        }
    });

    const action = (
        <>
            <Button onClick={onClose} variant="outlined" color="inherit" sx={{ textTransform: 'none' }}>
                Hủy bỏ
            </Button>
            <Button onClick={formik.handleSubmit} color="primary" variant="contained" sx={{ textTransform: 'none', px: 4, ml: 1 }}>
                {isEdit ? 'Cập nhật' : 'Thêm mới'}
            </Button>
        </>
    );

    return (
        <Popup
            open={open}
            onClosePopup={onClose}
            title={isEdit ? 'Chỉnh sửa tài khoản ngân hàng' : 'Thêm mới tài khoản ngân hàng'}
            size="sm"
            action={action}
        >
            <FormikProvider value={formik}>
                <Box pt={1}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Autocomplete
                                label="Ngân hàng"
                                name="bank"
                                options={banks}
                                getOptionLabel={(option) => option ? `${option.shortName || option.name} ${option.bin ? '(' + option.bin + ')' : ''}` : ''}
                                fullWidth
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Số tài khoản"
                                name="accountNumber"
                                placeholder="VD: 190312345678"
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Tên chủ tài khoản"
                                name="accountName"
                                placeholder="VD: NGUYEN VAN A"
                                required
                                onChange={(e) => {
                                    formik.setFieldValue('accountName', e.target.value.toUpperCase());
                                }}
                                inputProps={{ style: { textTransform: 'uppercase' } }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Chi nhánh ngân hàng"
                                name="branchName"
                                placeholder="VD: Chi nhánh Hà Nội / Chợ Lớn"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formik.values.isDefault}
                                        onChange={(e) => formik.setFieldValue('isDefault', e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Đặt làm tài khoản mặc định"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Ghi chú"
                                name="note"
                                multiline
                                rows={2}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </FormikProvider>
        </Popup>
    );
};

export default StaffBankAccountFormDialog;

import React, { useMemo } from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Grid, Button, Box, Paper } from '@mui/material';
import useStaffStore from '../../../../store/staffStore';
import TextField from '../../../../components/ui/TextField';
import TabAccordion from '../../../../components/ui/Tab/TabAccordion';

const StaffBankInfoForm = ({ staffData, onClose, onSaveSuccess, isView }) => {
    const { modifyStaff } = useStaffStore();

    const initialValues = useMemo(() => ({
        bankName: staffData?.bankName || '',
        bankAccountNumber: staffData?.bankAccountNumber || '',
        bankAccountName: staffData?.bankAccountName || '',
        bankBin: staffData?.bankBin || '',
    }), [staffData]);

    const validationSchema = Yup.object({});

    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            if (!staffData?.id) return;
            
            // Merge existing staffData with updated bank info
            const submitValues = {
                ...staffData,
                ...values
            };

            await modifyStaff(staffData.id, submitValues);
            if (onSaveSuccess) {
                onSaveSuccess();
            }
        },
    });

    const action = isView ? null : (
        <>
            <Button onClick={onClose} variant="outlined" color="inherit" sx={{ color: 'text.secondary', textTransform: 'none' }}>Hủy bỏ</Button>
            <Button onClick={formik.handleSubmit} color="primary" variant="contained" sx={{ textTransform: 'none', px: 4, ml: 1 }}>Lưu lại</Button>
        </>
    );

    return (
        <FormikProvider value={formik}>
            <div className="space-y-6 pb-4">
                <TabAccordion title="Thông tin tài khoản ngân hàng" open={true}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Tên ngân hàng" 
                                name="bankName" 
                                fullWidth
                                disabled={isView}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Số tài khoản" 
                                name="bankAccountNumber" 
                                fullWidth
                                disabled={isView}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Chủ tài khoản" 
                                name="bankAccountName" 
                                fullWidth
                                disabled={isView}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Mã BIN ngân hàng" 
                                name="bankBin" 
                                fullWidth
                                disabled={isView}
                            />
                        </Grid>
                    </Grid>
                </TabAccordion>

                {/* Form actions */}
                {action && (
                    <Box display="flex" justifyContent="flex-end" mt={4} className="pt-4 border-t border-border">
                        {action}
                    </Box>
                )}
            </div>
        </FormikProvider>
    );
};

export default StaffBankInfoForm;

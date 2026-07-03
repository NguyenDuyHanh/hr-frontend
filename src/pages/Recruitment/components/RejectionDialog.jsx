import React from 'react';
import { Button } from '@mui/material';
import { Formik } from 'formik';
import Popup from '../../../components/ui/Popup';
import TextField from '../../../components/ui/TextField';

const RejectionDialog = ({
    open,
    onClose,
    refusalReason,
    setRefusalReason,
    onConfirm
}) => {
    return (
        <Formik
            initialValues={{ refusalReason: refusalReason || '' }}
            enableReinitialize={true}
            onSubmit={() => {
                onConfirm();
            }}
        >
            {(formik) => {
                const actions = (
                    <>
                        <Button 
                            onClick={onClose} 
                            variant="outlined" 
                            color="inherit"
                            sx={{ textTransform: 'none' }}
                        >
                            Hủy
                        </Button>
                        <Button 
                            onClick={() => {
                                setRefusalReason(formik.values.refusalReason);
                                onConfirm();
                            }} 
                            variant="contained" 
                            color="error"
                            sx={{ textTransform: 'none', ml: 1 }}
                        >
                            Xác nhận loại
                        </Button>
                    </>
                );

                return (
                    <Popup
                        open={open}
                        onClosePopup={onClose}
                        title="Lý do từ chối hồ sơ ứng viên"
                        size="sm"
                        action={actions}
                    >
                        <TextField
                            name="refusalReason"
                            label="Lý do từ chối / loại hồ sơ"
                            fullWidth
                            multiline
                            rows={3}
                            notDelay={true}
                            onChange={(e) => {
                                formik.setFieldValue('refusalReason', e.target.value);
                                setRefusalReason(e.target.value);
                            }}
                            placeholder="Nhập lý do loại (như không đạt chuyên môn, không thỏa thuận được lương, ứng viên từ chối...)"
                            sx={{ mt: 1, minWidth: 350 }}
                        />
                    </Popup>
                );
            }}
        </Formik>
    );
};

export default RejectionDialog;

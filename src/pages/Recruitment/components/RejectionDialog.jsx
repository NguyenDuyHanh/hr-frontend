import React from 'react';
import { Button } from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Popup from '../../../components/ui/Popup';
import TextField from '../../../components/ui/TextField';

const validationSchema = Yup.object({
    refusalReason: Yup.string().trim().required('Vui lòng nhập lý do từ chối / loại hồ sơ')
});

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
            validationSchema={validationSchema}
            enableReinitialize={true}
            onSubmit={(values) => {
                setRefusalReason(values.refusalReason);
                onConfirm(values.refusalReason);
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
                            onClick={formik.handleSubmit} 
                            variant="contained" 
                            color="error"
                            sx={{ textTransform: 'none', ml: 1 }}
                        >
                            Xác nhận
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
                            required
                            fullWidth
                            multiline
                            rows={3}
                            notDelay={true}
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

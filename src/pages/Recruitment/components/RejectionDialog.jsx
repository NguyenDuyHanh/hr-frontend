import React from 'react';
import {
    TextField, Button
} from '@mui/material';
import Popup from '../../../components/ui/Popup';

const RejectionDialog = ({
    open,
    onClose,
    refusalReason,
    setRefusalReason,
    onConfirm
}) => {
    const actions = (
        <>
            <Button onClick={onClose} variant="outlined" color="inherit">Hủy</Button>
            <Button 
                onClick={onConfirm} 
                variant="contained" 
                color="error"
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
                label="Lý do từ chối / loại hồ sơ"
                fullWidth
                multiline
                rows={3}
                value={refusalReason}
                onChange={(e) => setRefusalReason(e.target.value)}
                placeholder="Nhập lý do loại (như không đạt chuyên môn, không thỏa thuận được lương, ứng viên từ chối...)"
                sx={{ mt: 1, minWidth: 350 }}
            />
        </Popup>
    );
};

export default RejectionDialog;

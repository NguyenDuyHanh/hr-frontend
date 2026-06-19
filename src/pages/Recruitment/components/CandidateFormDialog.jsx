import React, { useMemo, useState } from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Grid, Button, Stack, Link, CircularProgress, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Popup from '../../../components/ui/Popup';
import TextField from '../../../components/ui/TextField';
import SelectInput from '../../../components/ui/SelectInput';
import DateTimePicker from '../../../components/ui/DateTimePicker';
import ImageUpload from '../../../components/ui/ImageUpload';
import { uploadFile } from '../../../services/CloudinaryService';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CANDIDATE_STATUSES } from '../../../constants';

const genderOptions = [
    { value: 'Nam', name: 'Nam' },
    { value: 'Nữ', name: 'Nữ' },
    { value: 'Khác', name: 'Khác' }
];

const getFileNameFromUrl = (url) => {
    if (!url) return '';
    try {
        const decoded = decodeURIComponent(url);
        return decoded.substring(decoded.lastIndexOf('/') + 1);
    } catch (e) {
        return url.split('/').pop();
    }
};

const CandidateFormDialog = ({
    open,
    onClose,
    candidateInput,
    onSave,
    departments,
    positions
}) => {
    const [localUploadingCV, setLocalUploadingCV] = useState(false);

    const initialValues = useMemo(() => ({
        id: candidateInput.id || null,
        candidateCode: candidateInput.candidateCode || '',
        displayName: candidateInput.displayName || '',
        gender: candidateInput.gender || 'Nam',
        birthDate: candidateInput.birthDate ? new Date(candidateInput.birthDate) : null,
        email: candidateInput.email || '',
        phoneNumber: candidateInput.phoneNumber || '',
        currentResidence: candidateInput.currentResidence || '',
        imagePath: candidateInput.imagePath || '',
        cvFilePath: candidateInput.cvFilePath || '',
        status: candidateInput.status ?? 'SCREENING',
        recruitmentId: candidateInput.recruitmentId || '',
        departmentId: candidateInput.departmentId || '',
        positionId: candidateInput.positionId || '',
        note: candidateInput.note || ''
    }), [candidateInput]);

    const validationSchema = Yup.object({
        displayName: Yup.string().trim().required('Họ và tên là bắt buộc'),
        email: Yup.string().trim().email('Email không đúng định dạng').required('Email là bắt buộc'),
        phoneNumber: Yup.string().trim().required('Số điện thoại là bắt buộc'),
        departmentId: Yup.string().required('Vui lòng chọn phòng ban tiếp nhận'),
        positionId: Yup.string().required('Vui lòng chọn vị trí tiếp nhận'),
    });

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values) => {
            const submitValues = { ...values };
            const dateFields = ['birthDate'];
            dateFields.forEach(field => {
                if (values[field]) {
                    try {
                        submitValues[field] = format(new Date(values[field]), 'yyyy-MM-dd');
                    } catch (e) {
                        submitValues[field] = values[field];
                    }
                } else {
                    submitValues[field] = null;
                }
            });
            onSave(submitValues);
        }
    });

    const filteredPositions = useMemo(() => {
        if (!formik.values.departmentId) return [];
        return positions.filter(pos => pos.department?.id === formik.values.departmentId);
    }, [formik.values.departmentId, positions]);

    const handleLocalCVChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLocalUploadingCV(true);
        try {
            const url = await uploadFile(file);
            formik.setFieldValue('cvFilePath', url);
            toast.success("Tải tệp CV thành công");
        } catch (err) {
            toast.error(err.message || "Lỗi tải CV lên");
        } finally {
            setLocalUploadingCV(false);
        }
    };

    const actions = (
        <>
            <Button onClick={onClose} variant="outlined" color="inherit" sx={{ textTransform: 'none' }}>Hủy bỏ</Button>
            <Button onClick={formik.handleSubmit} variant="contained" color="primary" sx={{ textTransform: 'none', ml: 1 }}>Lưu lại</Button>
        </>
    );

    return (
        <Popup
            open={open}
            onClosePopup={onClose}
            title={candidateInput.id ? 'Cập nhật hồ sơ ứng viên' : 'Thêm ứng viên mới'}
            size="md"
            action={actions}
        >
            <FormikProvider value={formik}>
                <Grid container spacing={2} sx={{ pt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="candidateCode"
                            label="Mã ứng viên"
                            disabled
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="displayName"
                            label="Họ và tên"
                            required
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <SelectInput
                            name="gender"
                            label="Giới tính"
                            options={genderOptions}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DateTimePicker
                            name="birthDate"
                            label="Ngày sinh"
                            notValueMillisecond={true}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="email"
                            label="Email liên hệ"
                            required
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="phoneNumber"
                            label="Số điện thoại"
                            required
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="currentResidence"
                            label="Địa chỉ"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <SelectInput
                            name="departmentId"
                            label="Phòng ban tiếp nhận"
                            required
                            options={departments}
                            keyValue="id"
                            displayvalue="name"
                            handleChange={(event, value) => {
                                formik.setFieldValue('positionId', '');
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <SelectInput
                            name="positionId"
                            label="Vị trí tiếp nhận"
                            required
                            options={filteredPositions}
                            keyValue="id"
                            displayvalue="name"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <SelectInput
                            name="status"
                            label="Trạng thái tuyển dụng"
                            options={CANDIDATE_STATUSES}
                            keyValue="value"
                            displayvalue="label"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="note"
                            label="Ghi chú / Lý do từ chối"
                            multiline
                            rows={2}
                            placeholder="Nhập ghi chú chung hoặc lý do từ chối ứng viên..."
                            fullWidth
                        />
                    </Grid>
                    {/* File Upload Fields */}
                    <Grid item xs={12}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Button
                                variant="outlined"
                                component="label"
                                color="primary"
                                startIcon={localUploadingCV ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                                disabled={localUploadingCV}
                                sx={{ textTransform: 'none' }}
                            >
                                {localUploadingCV ? 'Đang tải lên...' : 'Tải CV (.pdf)'}
                                <input type="file" hidden accept=".pdf,.doc,.docx" onChange={handleLocalCVChange} />
                            </Button>
                             {formik.values.cvFilePath && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Link 
                                        href={formik.values.cvFilePath} 
                                        target="_blank" 
                                        rel="noopener" 
                                        sx={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: 0.5, 
                                            color: '#d32f2f', 
                                            textDecoration: 'none',
                                            maxWidth: '350px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                        title="Xem CV"
                                    >
                                        <PictureAsPdfIcon />
                                        <span style={{ fontSize: '12px', fontWeight: '500' }}>
                                            {getFileNameFromUrl(formik.values.cvFilePath)}
                                        </span>
                                    </Link>
                                    <IconButton 
                                        size="small" 
                                        onClick={() => {
                                            let downloadUrl = formik.values.cvFilePath;
                                            if (downloadUrl.includes('res.cloudinary.com')) {
                                                downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
                                            }
                                            window.open(downloadUrl, '_blank');
                                        }}
                                        sx={{ color: 'primary.main', p: 0.5 }}
                                        title="Tải CV về máy"
                                    >
                                        <FileDownloadIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            </FormikProvider>
        </Popup>
    );
};

export default CandidateFormDialog;

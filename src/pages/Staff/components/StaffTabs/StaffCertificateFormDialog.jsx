import React, { useMemo } from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Grid } from '@mui/material';
import Popup from '../../../../components/ui/Popup';
import TextField from '../../../../components/ui/TextField';
import SelectInput from '../../../../components/ui/SelectInput';
import DateTimePicker from '../../../../components/ui/DateTimePicker';
import { QualificationTypeOptions, DegreeLevelOptions, DegreeGradeOptions, QUALIFICATION_TYPE } from '../../../../constants';
import { format } from 'date-fns';

const StaffCertificateFormDialog = ({ open, onClose, certData, onSave }) => {
    const isEdit = !!certData?.id;

    const initialValues = useMemo(() => ({
        id: certData?.id || null,
        staffId: certData?.staffId || null,
        type: certData?.type || QUALIFICATION_TYPE.DEGREE,
        certificateName: certData?.certificateName || '',
        institution: certData?.institution || '',
        major: certData?.major || '',
        degreeLevel: certData?.degreeLevel || '',
        issueDate: certData?.issueDate ? new Date(certData.issueDate) : null,
        expiryDate: certData?.expiryDate ? new Date(certData.expiryDate) : null,
        grade: certData?.grade || '',
        credentialId: certData?.credentialId || '',
        fileUrl: certData?.fileUrl || '',
        note: certData?.note || ''
    }), [certData]);

    const validationSchema = Yup.object({
        type: Yup.string().required('Loại là bắt buộc'),
        certificateName: Yup.string().required('Tên bằng cấp / chứng chỉ là bắt buộc'),
        institution: Yup.string().required('Nơi cấp / Trường đào tạo là bắt buộc'),
    });

    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: (values) => {
            const submitValues = { ...values };
            if (values.issueDate) {
                submitValues.issueDate = format(new Date(values.issueDate), 'yyyy-MM-dd');
            }
            if (values.expiryDate) {
                submitValues.expiryDate = format(new Date(values.expiryDate), 'yyyy-MM-dd');
            }
            onSave(submitValues);
            onClose();
        }
    });

    const currentType = formik.values.type;
    const isDegree = currentType === QUALIFICATION_TYPE.DEGREE;
    const isCertificate = currentType === QUALIFICATION_TYPE.CERTIFICATE;

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
            title={isEdit ? 'Chỉnh sửa Bằng cấp / Chứng chỉ' : 'Thêm mới Bằng cấp / Chứng chỉ'}
            size="md"
            action={action}
        >
            <FormikProvider value={formik}>
                <Box pt={1}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <SelectInput
                                label="Loại"
                                name="type"
                                options={QualificationTypeOptions}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label={isDegree ? "Tên Bằng cấp" : "Tên Chứng chỉ"}
                                name="certificateName"
                                placeholder={isDegree ? "VD: Bằng Cử nhân CNTT" : "VD: AWS Certified Architect"}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label={isDegree ? "Trường đào tạo" : "Nơi cấp / Tổ chức"}
                                name="institution"
                                placeholder={isDegree ? "VD: Đại học Bách Khoa" : "VD: Amazon Web Services"}
                                required
                            />
                        </Grid>

                        {/* Fields specifically for DEGREE */}
                        {isDegree && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Chuyên ngành"
                                        name="major"
                                        placeholder="VD: Khoa học Máy tính"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <SelectInput
                                        label="Bậc học / Trình độ"
                                        name="degreeLevel"
                                        options={DegreeLevelOptions}
                                    />
                                </Grid>
                            </>
                        )}

                        {/* Fields specifically for CERTIFICATE */}
                        {isCertificate && (
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Số hiệu / Mã chứng chỉ"
                                    name="credentialId"
                                    placeholder="VD: AWS-12345678"
                                />
                            </Grid>
                        )}

                        <Grid item xs={12} sm={6}>
                            <DateTimePicker
                                label="Ngày cấp"
                                name="issueDate"
                                notValueMillisecond={true}
                            />
                        </Grid>

                        {/* Expiry date only for CERTIFICATE */}
                        {isCertificate && (
                            <Grid item xs={12} sm={6}>
                                <DateTimePicker
                                    label="Ngày hết hạn"
                                    name="expiryDate"
                                    notValueMillisecond={true}
                                />
                            </Grid>
                        )}

                        <Grid item xs={12} sm={6}>
                            {isDegree ? (
                                <SelectInput
                                    label="Xếp loại"
                                    name="grade"
                                    options={DegreeGradeOptions}
                                />
                            ) : (
                                <TextField
                                    label="Kết quả / Điểm số"
                                    name="grade"
                                    placeholder="VD: 7.5 IELTS, 850 TOEIC, PASS"
                                />
                            )}
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Đường dẫn File scan / Ảnh bằng (Cloudinary URL)"
                                name="fileUrl"
                                placeholder="https://res.cloudinary.com/..."
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

export default StaffCertificateFormDialog;

import React, { useMemo, useEffect, useState } from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Grid, Button, Box, Typography } from '@mui/material';
import useStaffStore from '../../../../store/staffStore';
import TextField from '../../../../components/ui/TextField';
import SelectInput from '../../../../components/ui/SelectInput';
import DateTimePicker from '../../../../components/ui/DateTimePicker';
import Autocomplete from '../../../../components/ui/Autocomplete';
import TabAccordion from '../../../../components/ui/Tab/TabAccordion';
import ImageUpload from '../../../../components/ui/ImageUpload';
import { 
    WorkingStatusOptions,
    GenderOptions
} from '../../../../constants';
import { getDepartments, getPositions } from '../../../../services/StaffService';
import { format } from 'date-fns';
import { getLeaveBalance } from '../../../../services/leaveService';

const StaffGeneralInfoForm = ({ staffData, onClose, onSaveSuccess, isView }) => {
    const { addStaff, modifyStaff } = useStaffStore();
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);

    useEffect(() => {
        const loadRefs = async () => {
            try {
                const depRes = await getDepartments();
                setDepartments(depRes?.data || []);
                const posRes = await getPositions();
                setPositions(posRes?.data || []);
            } catch (err) {
                console.error("Failed to load departments or positions", err);
            }
        };
        loadRefs();
    }, []);

    const initialValues = useMemo(() => ({
        id: staffData?.id || null,
        staffCode: staffData?.staffCode || '',
        displayName: staffData?.displayName || '',
        birthDate: staffData?.birthDate ? new Date(staffData.birthDate) : null,
        gender: staffData?.gender || 'MALE',
        phoneNumber: staffData?.phoneNumber || '',
        email: staffData?.email || '',
        workingStatus: staffData?.workingStatus || 'ACTIVE',
        idNumber: staffData?.idNumber || '',
        startDate: staffData?.startDate ? new Date(staffData.startDate) : null,
        currentAddress: staffData?.currentAddress || '',
        socialInsuranceCode: staffData?.socialInsuranceCode || '',
        department: staffData?.departmentId ? { id: staffData.departmentId, name: staffData.departmentName } : null,
        position: staffData?.positionId ? { id: staffData.positionId, name: staffData.positionName } : null,

        // 1. Personal Info
        avatarUrl: staffData?.avatarUrl || '',
        birthPlace: staffData?.birthPlace || '',
        nationality: staffData?.nationality || '',
        ethnics: staffData?.ethnics || '',
        religion: staffData?.religion || '',
        educationDegree: staffData?.educationDegree || '',

        // 2. Address
        province: staffData?.province || '',
        commune: staffData?.commune || '',
        permanentResidence: staffData?.permanentResidence || '',
        currentResidence: staffData?.currentResidence || '',

        // 3. Legal Docs
        idNumberIssueDate: staffData?.idNumberIssueDate ? new Date(staffData.idNumberIssueDate) : null,
        idNumberIssueBy: staffData?.idNumberIssueBy || '',
        companyEmail: staffData?.companyEmail || '',
        annualLeave: staffData?.annualLeave !== undefined && staffData?.annualLeave !== null ? staffData.annualLeave : 12.0,
        usedDays: 0,
        remainingDays: staffData?.annualLeave !== undefined && staffData?.annualLeave !== null ? staffData.annualLeave : 12.0,

        // 7. Tax & Insurance
        taxCode: staffData?.taxCode || '',
        healthInsuranceNumber: staffData?.healthInsuranceNumber || ''
    }), [staffData]);

    const validationSchema = Yup.object({
        // Validation schemas
    });

    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const submitValues = { 
                ...values,
                departmentId: values.department?.id || null,
                positionId: values.position?.id || null,
                department: undefined,
                position: undefined,
                usedDays: undefined,
                remainingDays: undefined
            };

            // Format dates
            const dateFields = [
                'birthDate',
                'startDate',
                'idNumberIssueDate'
            ];

            dateFields.forEach(field => {
                if (values[field]) {
                    submitValues[field] = format(new Date(values[field]), 'yyyy-MM-dd');
                } else {
                    submitValues[field] = null;
                }
            });

            if (values.id) {
                await modifyStaff(values.id, submitValues);
            } else {
                await addStaff(submitValues);
            }
            if (onSaveSuccess) onSaveSuccess();
        },
    });

    const { values, setFieldValue } = formik;

    useEffect(() => {
        const fetchBalance = async () => {
            if (staffData?.id) {
                try {
                    const currentYear = new Date().getFullYear();
                    const balanceRes = await getLeaveBalance(staffData.id, currentYear);
                    const balance = balanceRes?.data || balanceRes;
                    if (balance) {
                        setFieldValue('usedDays', balance.usedDays ?? 0);
                        setFieldValue('remainingDays', balance.remainingDays ?? 12);
                    }
                } catch (err) {
                    console.error("Failed to fetch leave balance", err);
                }
            }
        };
        fetchBalance();
    }, [staffData, setFieldValue]);

    const filteredPositions = useMemo(() => {
        if (!values.department?.id) return positions;
        return positions.filter(pos => pos.department?.id === values.department.id);
    }, [positions, values.department?.id]);

    const action = isView ? null : (
        <>
            <Button onClick={onClose} variant="outlined" color="inherit" sx={{ color: 'text.secondary', textTransform: 'none' }}>Hủy bỏ</Button>
            <Button onClick={formik.handleSubmit} color="primary" variant="contained" sx={{ textTransform: 'none', px: 4, ml: 1 }}>Lưu lại</Button>
        </>
    );

    return (
        <FormikProvider value={formik}>
            <div className="space-y-4 pb-4">
                {/* 1. Thông tin cá nhân */}
                <TabAccordion title="Thông tin cá nhân" open={true}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <ImageUpload label="Ảnh đại diện" name="avatarUrl" disabled={isView} />
                        </Grid>
                        <Grid item xs={12} md={9} sx={{ marginTop: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <TextField label="Họ và tên" name="displayName"  fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <SelectInput label="Giới tính" name="gender" options={GenderOptions} fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <DateTimePicker label="Ngày sinh" name="birthDate" notValueMillisecond={true} fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <TextField label="Nơi sinh" name="birthPlace" fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <TextField label="Quốc tịch" name="nationality" fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <TextField label="Dân tộc" name="ethnics" fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <TextField label="Tôn giáo" name="religion" fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <TextField label="Trình độ học vấn" name="educationDegree" fullWidth disabled={isView} />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </TabAccordion>

                {/* 2. Địa chỉ thường trú / tạm trú */}
                <TabAccordion title="Địa chỉ thường trú / tạm trú" open={false}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField 
                                label="Tỉnh thường trú" 
                                name="province" 
                                fullWidth 
                                disabled={isView}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField 
                                label="Xã thường trú" 
                                name="commune" 
                                fullWidth 
                                disabled={isView}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Chi tiết thường trú" name="permanentResidence" multiline rows={2} fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Tạm trú" name="currentResidence" multiline rows={2} fullWidth disabled={isView} />
                        </Grid>
                    </Grid>
                </TabAccordion>

                {/* 3. Giấy tờ pháp lý */}
                <TabAccordion title="Giấy tờ pháp lý" open={false}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} lg={4}>
                            <TextField label="Số CCCD/CMND" name="idNumber" fullWidth inputProps={{ maxLength: 12 }} disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={4}>
                            <DateTimePicker label="Ngày cấp CCCD/CMND" name="idNumberIssueDate" notValueMillisecond={true} fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={4}>
                            <TextField label="Nơi cấp CCCD/CMND" name="idNumberIssueBy" fullWidth disabled={isView} />
                        </Grid>
                    </Grid>
                </TabAccordion>

                {/* 4. Thông tin hồ sơ nhân viên */}
                <TabAccordion title="Thông tin hồ sơ nhân viên" open={true}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Mã nhân viên" name="staffCode" readOnly fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Trạng thái làm việc" name="workingStatus" options={WorkingStatusOptions} fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <DateTimePicker label="Ngày chính thức" name="startDate" notValueMillisecond={true} fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Email công ty" name="companyEmail" fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField type="number" label="Định mức phép năm" name="annualLeave" fullWidth disabled={isView} />
                        </Grid>
                        {staffData?.id && (
                            <>
                                <Grid item xs={12} sm={6} lg={3}>
                                    <TextField 
                                        label="Số ngày đã nghỉ" 
                                        name="usedDays"
                                        fullWidth 
                                        disabled 
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={3}>
                                    <TextField 
                                        label="Số ngày phép còn lại" 
                                        name="remainingDays"
                                        fullWidth 
                                        disabled 
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </TabAccordion>

                {/* 5. Tổ chức */}
                <TabAccordion title="Phòng ban" open={false}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} lg={6}>
                            <Autocomplete 
                                label="Phòng ban" 
                                name="department" 
                                options={departments}
                                getOptionLabel={(option) => option?.name || ''}
                                onChange={(event, val) => {
                                    setFieldValue('department', val);
                                    if (val && values.position) {
                                        const posFull = positions.find(p => p.id === values.position.id);
                                        if (posFull && posFull.department?.id !== val.id) {
                                            setFieldValue('position', null);
                                        }
                                    } else if (!val) {
                                        setFieldValue('position', null);
                                    }
                                }}
                                fullWidth
                                disabled={isView}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={6}>
                            <Autocomplete 
                                label="Vị trí" 
                                name="position" 
                                options={filteredPositions}
                                getOptionLabel={(option) => option?.name || ''}
                                fullWidth
                                disabled={isView}
                            />
                        </Grid>
                    </Grid>
                </TabAccordion>

                {/* 6. Thông tin liên hệ */}
                <TabAccordion title="Thông tin liên hệ" open={false}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Số điện thoại" name="phoneNumber" fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Email cá nhân" name="email" fullWidth disabled={isView} />
                        </Grid>
                    </Grid>
                </TabAccordion>

                {/* 7. Thuế & bảo hiểm */}
                <TabAccordion title="Thuế & bảo hiểm" open={false}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} lg={4}>
                            <TextField label="Mã số thuế" name="taxCode" fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={4}>
                            <TextField label="Mã số BHXH" name="socialInsuranceCode" fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={4}>
                            <TextField label="Mã số BH sức khỏe" name="healthInsuranceNumber" fullWidth disabled={isView} />
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

export default StaffGeneralInfoForm;

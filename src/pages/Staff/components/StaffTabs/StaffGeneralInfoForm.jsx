import React, { useMemo, useEffect, useState } from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Grid, Button, Box, Typography } from '@mui/material';
import { useAddStaff, useModifyStaff } from '../../api';
import TextField from '../../../../components/ui/TextField';
import SelectInput from '../../../../components/ui/SelectInput';
import DateTimePicker from '../../../../components/ui/DateTimePicker';
import AsyncAutocomplete from '../../../../components/ui/AsyncAutocomplete';
import TabAccordion from '../../../../components/ui/Tab/TabAccordion';
import ImageUpload from '../../../../components/ui/ImageUpload';
import AddressSelectGroup from '../AddressSelectGroup';
import { 
    WorkingStatusOptions,
    GenderOptions,
    EducationDegreeOptions
} from '../../../../constants';
import { getDepartments, getPositions } from '../../../../services/StaffService';
import { getAllEthnics } from '../../../../services/ethnicService';
import { format } from 'date-fns';
import { getLeaveBalance } from '../../../../services/leaveService';

const StaffGeneralInfoForm = ({ staffData, onClose, onSaveSuccess, isView }) => {
    const addStaffMutation = useAddStaff();
    const modifyStaffMutation = useModifyStaff();

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
        ethnic: staffData?.ethnicId ? { id: staffData.ethnicId, name: staffData.ethnicName } : null,
        religion: staffData?.religion || '',
        educationDegree: staffData?.educationDegree || 'BACHELOR',

        // 2. Address - Permanent
        permanentProvince: staffData?.permanentProvinceName ? { name: staffData.permanentProvinceName } : null,
        permanentAdministrativeUnit: (staffData?.permanentAdministrativeUnitId || staffData?.permanentWardId) ? { 
            id: staffData.permanentAdministrativeUnitId || staffData.permanentWardId, 
            name: staffData.permanentAdministrativeUnitName || staffData.permanentWardName 
        } : null,
        permanentAddressDetail: staffData?.permanentAddressDetail || '',

        // 2. Address - Current
        currentProvince: staffData?.currentProvinceName ? { name: staffData.currentProvinceName } : null,
        currentAdministrativeUnit: (staffData?.currentAdministrativeUnitId || staffData?.currentWardId) ? { 
            id: staffData.currentAdministrativeUnitId || staffData.currentWardId, 
            name: staffData.currentAdministrativeUnitName || staffData.currentWardName 
        } : null,
        currentAddressDetail: staffData?.currentAddressDetail || '',

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
        displayName: Yup.string().required('Họ và tên là bắt buộc'),
        workingStatus: Yup.string().required('Trạng thái làm việc là bắt buộc'),
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
                ethnicId: values.ethnic?.id || null,
                educationDegree: values.educationDegree ? values.educationDegree : null,
                permanentAdministrativeUnitId: values.permanentAdministrativeUnit?.id || values.permanentWard?.id || null,
                currentAdministrativeUnitId: values.currentAdministrativeUnit?.id || values.currentWard?.id || null,
                department: undefined,
                position: undefined,
                ethnic: undefined,
                permanentProvince: undefined,
                permanentAdministrativeUnit: undefined,
                permanentWard: undefined,
                currentProvince: undefined,
                currentAdministrativeUnit: undefined,
                currentWard: undefined,
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
                await modifyStaffMutation.mutateAsync(submitValues);
            } else {
                await addStaffMutation.mutateAsync(submitValues);
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
                                    <TextField label="Họ và tên" name="displayName" fullWidth disabled={isView} required />
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
                                    <AsyncAutocomplete
                                        label="Dân tộc"
                                        name="ethnic"
                                        api={getAllEthnics}
                                        displayData="name"
                                        value={formik.values.ethnic || null}
                                        readOnly={isView}
                                        disabled={isView}
                                        formik={formik}
                                        placeholder="Chọn Dân tộc"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <TextField label="Tôn giáo" name="religion" fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <SelectInput
                                        label="Trình độ học vấn cao nhất"
                                        name="educationDegree"
                                        options={EducationDegreeOptions}
                                        fullWidth
                                        disabled={isView}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </TabAccordion>

                {/* 2. Địa chỉ thường trú */}
                <TabAccordion title="Địa chỉ thường trú" open={false}>
                    <AddressSelectGroup
                        provinceFieldName="permanentProvince"
                        unitFieldName="permanentAdministrativeUnit"
                        detailFieldName="permanentAddressDetail"
                        provinceLabel="Tỉnh / Thành phố thường trú"
                        unitLabel="Đơn vị hành chính thường trú (Xã / Phường / Thị trấn)"
                        detailLabel="Địa chỉ chi tiết thường trú (Số nhà, Tên đường...)"
                        formik={formik}
                        isView={isView}
                    />
                </TabAccordion>

                {/* 3. Địa chỉ tạm trú (Nơi ở hiện tại) */}
                <TabAccordion title="Tạm trú (Nơi ở hiện tại)" open={false}>
                    <AddressSelectGroup
                        provinceFieldName="currentProvince"
                        unitFieldName="currentAdministrativeUnit"
                        detailFieldName="currentAddressDetail"
                        provinceLabel="Tỉnh / Thành phố tạm trú"
                        unitLabel="Đơn vị hành chính tạm trú (Xã / Phường / Thị trấn)"
                        detailLabel="Địa chỉ chi tiết tạm trú (Số nhà, Tên đường...)"
                        formik={formik}
                        isView={isView}
                    />
                </TabAccordion>

                {/* 4. Giấy tờ pháp lý */}
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

                {/* 5. Thông tin hồ sơ nhân viên */}
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

                {/* 6. Tổ chức */}
                <TabAccordion title="Phòng ban & Vị trí" open={false}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} lg={6}>
                            <AsyncAutocomplete 
                                label="Phòng ban" 
                                name="department" 
                                api={getDepartments}
                                displayData="name"
                                value={formik.values.department || null}
                                onChange={(_, val) => {
                                    setFieldValue('department', val);
                                    setFieldValue('position', null);
                                }}
                                readOnly={isView}
                                disabled={isView}
                                formik={formik}
                                placeholder="Chọn Phòng ban"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={6}>
                            <AsyncAutocomplete 
                                label="Vị trí" 
                                name="position" 
                                api={getPositions}
                                displayData="name"
                                value={formik.values.position || null}
                                readOnly={isView}
                                disabled={isView}
                                formik={formik}
                                placeholder="Chọn Vị trí"
                            />
                        </Grid>
                    </Grid>
                </TabAccordion>

                {/* 7. Thông tin liên hệ */}
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

                {/* 8. Thuế & bảo hiểm */}
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

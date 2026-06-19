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
    GenderOptions,
    MaritalStatusOptions,
    NationalityOptions,
    EthnicsOptions,
    ReligionOptions,
    EducationDegreeOptions,
    ProvinceOptions,
    WardOptionsMap,
    WorkingFormatOptions,
    StaffPhaseOptions,
    PositionTypeOptions,
    ShiftTypeOptions,
    FixShiftWorkOptions,
    LeaveShiftTypeOptions,
    WeekDayOptions,
    OrganizationOptions,
    HealthCarePlaceOptions,
    StatusOptions,
    PositionTitleOptions
} from '../../../../constants';
import { getDepartments, getPositions } from '../../../../services/StaffService';
import { format } from 'date-fns';

const maritalStatusOptions = MaritalStatusOptions;
const nationalityOptions = NationalityOptions;
const ethnicsOptions = EthnicsOptions;
const religionOptions = ReligionOptions;
const educationDegreeOptions = EducationDegreeOptions;
const provinceOptions = ProvinceOptions;
const wardOptionsMap = WardOptionsMap;
const workingFormatOptions = WorkingFormatOptions;
const staffPhaseOptions = StaffPhaseOptions;
const positionTypeOptions = PositionTypeOptions;
const shiftTypeOptions = ShiftTypeOptions;
const fixShiftWorkOptions = FixShiftWorkOptions;
const leaveShiftTypeOptions = LeaveShiftTypeOptions;
const weekDayOptions = WeekDayOptions;
const organizationOptions = OrganizationOptions;
const healthCarePlaceOptions = HealthCarePlaceOptions;
const statusOptions = StatusOptions;
const positionTitleOptions = PositionTitleOptions;

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
        gender: staffData?.gender || '',
        phoneNumber: staffData?.phoneNumber || '',
        email: staffData?.email || '',
        workingStatus: staffData?.workingStatus || '',
        idNumber: staffData?.idNumber || '',
        recruitmentDate: staffData?.recruitmentDate ? new Date(staffData.recruitmentDate) : null,
        startDate: staffData?.startDate ? new Date(staffData.startDate) : null,
        currentAddress: staffData?.currentAddress || '',
        socialInsuranceCode: staffData?.socialInsuranceCode || '',
        level: staffData?.level || '',
        department: staffData?.departmentId ? { id: staffData.departmentId, name: staffData.departmentName } : null,
        position: staffData?.positionId ? { id: staffData.positionId, name: staffData.positionName } : null,

        // 1. Personal Info
        imagePath: staffData?.imagePath || '',
        maritalStatus: staffData?.maritalStatus || '',
        birthPlace: staffData?.birthPlace || '',
        nationalityId: staffData?.nationalityId || 'VN',
        ethnicsId: staffData?.ethnicsId || 'KINH',
        religionId: staffData?.religionId || 'NONE',
        educationDegreeId: staffData?.educationDegreeId || '',

        // 2. Address
        provinceId: staffData?.provinceId || '',
        administrativeunitId: staffData?.administrativeunitId || '',
        permanentResidence: staffData?.permanentResidence || '',
        currentResidence: staffData?.currentResidence || '',
        homeTown: staffData?.homeTown || '',

        // 3. Legal Docs
        idNumberIssueDate: staffData?.idNumberIssueDate ? new Date(staffData.idNumberIssueDate) : null,
        idNumberIssueBy: staffData?.idNumberIssueBy || '',
        personalIdentificationNumber: staffData?.personalIdentificationNumber || '',
        personalIdentificationIssueDate: staffData?.personalIdentificationIssueDate ? new Date(staffData.personalIdentificationIssueDate) : null,
        personalIdentificationIssuePlace: staffData?.personalIdentificationIssuePlace || '',
        passportNumber: staffData?.passportNumber || '',
        workPermitNumber: staffData?.workPermitNumber || '',

        // 4. HR Profile
        statusId: staffData?.statusId || 'ACTIVE',
        staffWorkingFormat: staffData?.staffWorkingFormat || 'FULLTIME',
        introducerId: staffData?.introducerId || '',
        recruiterId: staffData?.recruiterId || '',
        apprenticeDays: staffData?.apprenticeDays ?? 0,
        companyEmail: staffData?.companyEmail || '',
        staffPhase: staffData?.staffPhase || 'OFFICIAL',
        staffPositionType: staffData?.staffPositionType || 'STAFF',
        healthCareRegistrationPlaceId: staffData?.healthCareRegistrationPlaceId || '',
        staffWorkShiftType: staffData?.staffWorkShiftType || 'FIXED',
        fixShiftWorkId: staffData?.fixShiftWorkId || 'HC',
        staffLeaveShiftType: staffData?.staffLeaveShiftType || 'FIXED',
        fixLeaveWeekDay: staffData?.fixLeaveWeekDay || 'SATURDAY',
        fixLeaveWeekDay2: staffData?.fixLeaveWeekDay2 || 'SUNDAY',

        // Checkboxes
        skipTimekeeping: staffData?.skipTimekeeping ?? false,
        skipLateEarlyCount: staffData?.skipLateEarlyCount ?? false,
        skipOvertimeCount: staffData?.skipOvertimeCount ?? false,
        onBlacklist: staffData?.onBlacklist ?? false,
        hasSocialIns: staffData?.hasSocialIns ?? true,
        unemploymentDeclaration: staffData?.unemploymentDeclaration ?? false,
        allowExternalIpTimekeeping: staffData?.allowExternalIpTimekeeping ?? false,

        // 5. Organization
        organizationId: staffData?.organizationId || 'CORP',
        positionTitleId: staffData?.positionTitleId || 'STAFF',

        // 6. Contact Person
        contactPersonInfo: staffData?.contactPersonInfo || '',

        // 7. Tax & Insurance
        taxCode: staffData?.taxCode || '',
        socialInsuranceNumber: staffData?.socialInsuranceNumber || '',
        healthInsuranceNumber: staffData?.healthInsuranceNumber || '',
        socialInsuranceNote: staffData?.socialInsuranceNote || ''
    }), [staffData]);

    const validationSchema = Yup.object({
        // staffCode: Yup.string().required('Mã nhân viên là bắt buộc'),
        // displayName: Yup.string().required('Họ và tên là bắt buộc'),
        // workingStatus: Yup.mixed().required('Trạng thái là bắt buộc'),
        // birthDate: Yup.date().required('Ngày sinh là bắt buộc').nullable(),
        // nationalityId: Yup.string().required('Quốc tịch là bắt buộc'),
        // provinceId: Yup.string().required('Tỉnh thường trú là bắt buộc'),
        // phoneNumber: Yup.string().required('Số điện thoại là bắt buộc').max(11, 'Số điện thoại tối đa 11 số'),
        // email: Yup.string().email('Email cá nhân không hợp lệ').required('Email cá nhân là bắt buộc'),
        // companyEmail: Yup.string().email('Email công ty không hợp lệ').required('Email công ty là bắt buộc'),
        // recruitmentDate: Yup.date().required('Ngày vào là bắt buộc').nullable(),
        // startDate: Yup.date().required('Ngày chính thức là bắt buộc').nullable(),
        // apprenticeDays: Yup.number().min(0, 'Tối thiểu là 0').required('Số ngày học việc/thử việc là bắt buộc'),
        // statusId: Yup.string().required('Trạng thái hồ sơ là bắt buộc'),
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
                position: undefined
            };

            // Format dates
            const dateFields = [
                'birthDate',
                'recruitmentDate',
                'startDate',
                'idNumberIssueDate',
                'personalIdentificationIssueDate'
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

    // Reset administrative unit if province changes
    const handleProvinceChange = (provinceId) => {
        setFieldValue('provinceId', provinceId);
        setFieldValue('administrativeunitId', '');
    };

    // Reset allowExternalIpTimekeeping if skipTimekeeping checked
    useEffect(() => {
        if (values.skipTimekeeping) {
            setFieldValue('allowExternalIpTimekeeping', false);
        }
    }, [values.skipTimekeeping, setFieldValue]);


    const filteredPositions = useMemo(() => {
        if (!values.department?.id) return positions;
        return positions.filter(pos => pos.department?.id === values.department.id);
    }, [positions, values.department?.id]);

    const activeWards = useMemo(() => {
        return values.provinceId ? (wardOptionsMap[values.provinceId] || []) : [];
    }, [values.provinceId]);

    const isForeigner = useMemo(() => {
        return values.nationalityId !== 'VN';
    }, [values.nationalityId]);

    const action = isView ? (
        <Button onClick={onClose} variant="contained" color="primary" sx={{ textTransform: 'none', px: 4 }}>Đóng</Button>
    ) : (
        <>
            <Button onClick={onClose} variant="outlined" color="inherit" sx={{ color: 'text.secondary', textTransform: 'none' }}>Hủy bỏ</Button>
            <Button onClick={formik.handleSubmit} color="primary" variant="contained" sx={{ textTransform: 'none', px: 4, ml: 1 }}>Lưu lại</Button>
        </>
    );

    return (
        <FormikProvider value={formik}>
            <div className="space-y-4">
                {/* 1. Thông tin cá nhân */}
                <TabAccordion title="Thông tin cá nhân" open={true}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <ImageUpload label="Ảnh đại diện" name="imagePath" disabled={isView} />
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
                                {/* <Grid item xs={12} sm={6} lg={4}>
                                    <SelectInput label="Tình trạng hôn nhân" name="maritalStatus" options={maritalStatusOptions} fullWidth disabled={isView} />
                                </Grid> */}
                                <Grid item xs={12} sm={6} lg={4}>
                                    <TextField label="Nơi sinh" name="birthPlace" fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <SelectInput label="Quốc tịch" name="nationalityId" options={nationalityOptions} fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <SelectInput label="Dân tộc" name="ethnicsId" options={ethnicsOptions} fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <SelectInput label="Tôn giáo" name="religionId" options={religionOptions} fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <SelectInput label="Trình độ học vấn" name="educationDegreeId" options={educationDegreeOptions} fullWidth disabled={isView} />
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
                                name="provinceId" 
                                // required 
                                fullWidth 
                                disabled={isView}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField 
                                label="Xã thường trú" 
                                name="administrativeunitId" 
                                fullWidth 
                                disabled={isView}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={6}>
                            <TextField label="Quê quán" name="homeTown" fullWidth disabled={isView} />
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
                            <TextField label="Số CCCD/CMND" name="personalIdentificationNumber" fullWidth inputProps={{ maxLength: 12 }} disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={4}>
                            <DateTimePicker label="Ngày cấp CCCD/CMND" name="personalIdentificationIssueDate" notValueMillisecond={true} fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={4}>
                            <TextField label="Nơi cấp CCCD/CMND" name="personalIdentificationIssuePlace" fullWidth disabled={isView} />
                        </Grid>
                        {isForeigner && (
                            <>
                                <Grid item xs={12} sm={6} lg={3}>
                                    <TextField label="Số hộ chiếu (Passport)" name="passportNumber" fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={3}>
                                    <TextField label="Số giấy phép lao động" name="workPermitNumber" fullWidth disabled={isView} />
                                </Grid>
                            </>
                        )}
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
                            <SelectInput label="Trạng thái hồ sơ" name="statusId" options={statusOptions} fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Hình thức làm việc" name="staffWorkingFormat" options={workingFormatOptions} fullWidth disabled={isView} />
                        </Grid>
                        {/* <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Người giới thiệu" name="introducerId" options={[]} fullWidth placeholder="Chọn người giới thiệu..." disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Người quyết định tuyển dụng" name="recruiterId" options={[]} fullWidth placeholder="Chọn người quyết định..." disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <DateTimePicker label="Ngày vào" name="recruitmentDate" notValueMillisecond={true} required fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Số ngày HV/TV" name="apprenticeDays" type="number" required fullWidth disabled={isView} />
                        </Grid> */}
                        <Grid item xs={12} sm={6} lg={3}>
                            <DateTimePicker label="Ngày chính thức" name="startDate" notValueMillisecond={true} fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Email công ty" name="companyEmail" fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Tình trạng nhân sự" name="staffPhase" options={staffPhaseOptions} fullWidth disabled={isView} />
                        </Grid>
                        {/* <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Loại vị trí việc làm" name="staffPositionType" options={positionTypeOptions} fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Nơi mong muốn ĐKKCB" name="healthCareRegistrationPlaceId" options={healthCarePlaceOptions} fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Loại phân ca" name="staffWorkShiftType" options={shiftTypeOptions} fullWidth disabled={isView} />
                        </Grid>
                        {values.staffWorkShiftType === 'FIXED' && (
                            <Grid item xs={12} sm={6} lg={3}>
                                <SelectInput label="Ca làm việc cố định" name="fixShiftWorkId" options={fixShiftWorkOptions} fullWidth disabled={isView} />
                            </Grid>
                        )}
                        <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Loại nghỉ trong tháng" name="staffLeaveShiftType" options={leaveShiftTypeOptions} fullWidth disabled={isView} />
                        </Grid>
                        {values.staffLeaveShiftType === 'FIXED' && (
                            <>
                                <Grid item xs={12} sm={6} lg={3}>
                                    <SelectInput label="Ngày nghỉ cố định 1" name="fixLeaveWeekDay" options={weekDayOptions} fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={3}>
                                    <SelectInput label="Ngày nghỉ cố định 2" name="fixLeaveWeekDay2" options={weekDayOptions} fullWidth disabled={isView} />
                                </Grid>
                            </>
                        )} */}
                    </Grid>
                </TabAccordion>

                {/* 5. Tổ chức */}
                <TabAccordion title="Tổ chức" open={false}>
                    <Grid container spacing={2}>
                        {/* <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Đơn vị" name="organizationId" options={organizationOptions} fullWidth disabled={isView} />
                        </Grid> */}
                        <Grid item xs={12} sm={6} lg={3}>
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
                        <Grid item xs={12} sm={6} lg={3}>
                            <Autocomplete 
                                label="Vị trí" 
                                name="position" 
                                options={filteredPositions}
                                getOptionLabel={(option) => option?.name || ''}
                                fullWidth
                                disabled={isView}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Cấp bậc" name="level" fullWidth disabled={isView} />
                        </Grid>
                        {/* <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Chức danh khác (Title)" name="positionTitleId" options={positionTitleOptions} fullWidth disabled={isView} />
                        </Grid> */}
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
                        <Grid item xs={12} sm={12}>
                            <TextField label="Người liên hệ khẩn cấp (tên / SĐT / quan hệ)" name="contactPersonInfo" multiline rows={2} fullWidth disabled={isView} />
                        </Grid>
                    </Grid>
                </TabAccordion>

                {/* 7. Thuế & bảo hiểm */}
                <TabAccordion title="Thuế & bảo hiểm" open={false}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Mã số thuế" name="taxCode" fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Mã số BHXH" name="socialInsuranceNumber" fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Mã số BH sức khỏe" name="healthInsuranceNumber" fullWidth disabled={isView} />
                        </Grid>
                        {/* <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Tình trạng sổ BHXH" name="socialInsuranceNote" fullWidth disabled={isView} />
                        </Grid> */}
                    </Grid>
                </TabAccordion>

                {/* Form actions */}
                <Box display="flex" justifyContent="flex-end" mt={4} className="pt-4 border-t border-border">
                    {action}
                </Box>
            </div>
        </FormikProvider>
    );
};

export default StaffGeneralInfoForm;

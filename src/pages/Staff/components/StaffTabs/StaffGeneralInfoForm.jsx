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
import { WorkingStatusOptions } from '../../../../LocalConstants';
import { getDepartments, getPositions } from '../../../../services/StaffService';
import { format } from 'date-fns';

// Static options for references
const maritalStatusOptions = [
    { value: 'single', name: 'Độc thân' },
    { value: 'married', name: 'Đã kết hôn' },
    { value: 'divorced', name: 'Ly hôn' },
    { value: 'widowed', name: 'Góa' }
];

const nationalityOptions = [
    { value: 'VN', name: 'Việt Nam' },
    { value: 'US', name: 'Mỹ' },
    { value: 'JP', name: 'Nhật Bản' },
    { value: 'KR', name: 'Hàn Quốc' },
    { value: 'CN', name: 'Trung Quốc' }
];

const ethnicsOptions = [
    { value: 'kinh', name: 'Kinh' },
    { value: 'tay', name: 'Tày' },
    { value: 'thai', name: 'Thái' },
    { value: 'muong', name: 'Mường' },
    { value: 'khmer', name: 'Khmer' },
    { value: 'other', name: 'Khác' }
];

const religionOptions = [
    { value: 'none', name: 'Không' },
    { value: 'buddhism', name: 'Phật giáo' },
    { value: 'catholicism', name: 'Công giáo' },
    { value: 'protestantism', name: 'Tin lành' },
    { value: 'caodai', name: 'Cao đài' },
    { value: 'hoahao', name: 'Hòa hảo' }
];

const educationDegreeOptions = [
    { value: 'highschool', name: 'Trung học' },
    { value: 'college', name: 'Cao đẳng' },
    { value: 'university', name: 'Đại học' },
    { value: 'master', name: 'Thạc sĩ' },
    { value: 'doctor', name: 'Tiến sĩ' }
];

const provinceOptions = [
    { value: 'HN', name: 'Hà Nội' },
    { value: 'HCM', name: 'TP. Hồ Chí Minh' },
    { value: 'DN', name: 'Đà Nẵng' },
    { value: 'HP', name: 'Hải Phòng' },
    { value: 'CT', name: 'Cần Thơ' }
];

const wardOptionsMap = {
    'HN': [
        { value: 'HN-BD', name: 'Quận Ba Đình' },
        { value: 'HN-HK', name: 'Quận Hoàn Kiếm' },
        { value: 'HN-CG', name: 'Quận Cầu Giấy' }
    ],
    'HCM': [
        { value: 'HCM-Q1', name: 'Quận 1' },
        { value: 'HCM-Q3', name: 'Quận 3' },
        { value: 'HCM-TD', name: 'TP. Thủ Đức' }
    ],
    'DN': [
        { value: 'DN-HC', name: 'Quận Hải Châu' },
        { value: 'DN-TK', name: 'Quận Thanh Khê' }
    ],
    'HP': [
        { value: 'HP-HB', name: 'Quận Hồng Bàng' }
    ],
    'CT': [
        { value: 'CT-NK', name: 'Quận Ninh Kiều' }
    ]
};

const workingFormatOptions = [
    { value: 'fulltime', name: 'Toàn thời gian' },
    { value: 'parttime', name: 'Bán thời gian' },
    { value: 'seasonal', name: 'Thời vụ' },
    { value: 'freelance', name: 'CTV' }
];

const staffPhaseOptions = [
    { value: 'apprentice', name: 'Học việc' },
    { value: 'probation', name: 'Thử việc' },
    { value: 'official', name: 'Chính thức' }
];

const positionTypeOptions = [
    { value: 'manager', name: 'Nhà quản lý' },
    { value: 'specialist', name: 'Chuyên môn kỹ thuật' },
    { value: 'staff', name: 'Nhân viên nghiệp vụ' },
    { value: 'other', name: 'Khác' }
];

const shiftTypeOptions = [
    { value: 'fixed', name: 'Cố định' },
    { value: 'flexible', name: 'Linh hoạt' }
];

const fixShiftWorkOptions = [
    { value: 'hc', name: 'Ca hành chính (8h-17h)' },
    { value: 'morning', name: 'Ca sáng (6h-14h)' },
    { value: 'afternoon', name: 'Ca chiều (14h-22h)' }
];

const leaveShiftTypeOptions = [
    { value: 'fixed', name: 'Nghỉ cố định' },
    { value: 'flexible', name: 'Nghỉ linh hoạt' }
];

const weekDayOptions = [
    { value: 'monday', name: 'Thứ 2' },
    { value: 'tuesday', name: 'Thứ 3' },
    { value: 'wednesday', name: 'Thứ 4' },
    { value: 'thursday', name: 'Thứ 5' },
    { value: 'friday', name: 'Thứ 6' },
    { value: 'saturday', name: 'Thứ 7' },
    { value: 'sunday', name: 'Chủ Nhật' }
];

const organizationOptions = [
    { value: 'corp', name: 'Công ty Cổ phần HRM' },
    { value: 'north_branch', name: 'Chi nhánh Miền Bắc' },
    { value: 'south_branch', name: 'Chi nhánh Miền Nam' }
];

const healthCarePlaceOptions = [
    { value: 'bm', name: 'Bệnh viện Bạch Mai' },
    { value: 'xp', name: 'Bệnh viện Xanh Pôn' },
    { value: 'cr', name: 'Bệnh viện Chợ Rẫy' }
];

const statusOptions = [
    { value: 'active', name: 'Đang làm việc' },
    { value: 'inactive', name: 'Đã nghỉ việc' },
    { value: 'suspended', name: 'Tạm đình chỉ' }
];

const positionTitleOptions = [
    { value: 'director', name: 'Giám đốc' },
    { value: 'manager', name: 'Trưởng phòng' },
    { value: 'teamlead', name: 'Trưởng nhóm' },
    { value: 'staff', name: 'Nhân viên' }
];

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
        ethnicsId: staffData?.ethnicsId || 'kinh',
        religionId: staffData?.religionId || 'none',
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
        statusId: staffData?.statusId || 'active',
        staffWorkingFormat: staffData?.staffWorkingFormat || 'fulltime',
        introducerId: staffData?.introducerId || '',
        recruiterId: staffData?.recruiterId || '',
        apprenticeDays: staffData?.apprenticeDays ?? 0,
        companyEmail: staffData?.companyEmail || '',
        staffPhase: staffData?.staffPhase || 'official',
        staffPositionType: staffData?.staffPositionType || 'staff',
        healthCareRegistrationPlaceId: staffData?.healthCareRegistrationPlaceId || '',
        staffWorkShiftType: staffData?.staffWorkShiftType || 'fixed',
        fixShiftWorkId: staffData?.fixShiftWorkId || 'hc',
        staffLeaveShiftType: staffData?.staffLeaveShiftType || 'fixed',
        fixLeaveWeekDay: staffData?.fixLeaveWeekDay || 'saturday',
        fixLeaveWeekDay2: staffData?.fixLeaveWeekDay2 || 'sunday',

        // Checkboxes
        skipTimekeeping: staffData?.skipTimekeeping ?? false,
        skipLateEarlyCount: staffData?.skipLateEarlyCount ?? false,
        skipOvertimeCount: staffData?.skipOvertimeCount ?? false,
        onBlacklist: staffData?.onBlacklist ?? false,
        hasSocialIns: staffData?.hasSocialIns ?? true,
        unemploymentDeclaration: staffData?.unemploymentDeclaration ?? false,
        allowExternalIpTimekeeping: staffData?.allowExternalIpTimekeeping ?? false,

        // 5. Organization
        organizationId: staffData?.organizationId || 'corp',
        positionTitleId: staffData?.positionTitleId || 'staff',

        // 6. Contact Person
        contactPersonInfo: staffData?.contactPersonInfo || '',

        // 7. Tax & Insurance
        taxCode: staffData?.taxCode || '',
        socialInsuranceNumber: staffData?.socialInsuranceNumber || '',
        healthInsuranceNumber: staffData?.healthInsuranceNumber || '',
        socialInsuranceNote: staffData?.socialInsuranceNote || ''
    }), [staffData]);

    const validationSchema = Yup.object({
        staffCode: Yup.string().required('Mã nhân viên là bắt buộc'),
        displayName: Yup.string().required('Họ và tên là bắt buộc'),
        workingStatus: Yup.mixed().required('Trạng thái là bắt buộc'),
        birthDate: Yup.date().required('Ngày sinh là bắt buộc').nullable(),
        nationalityId: Yup.string().required('Quốc tịch là bắt buộc'),
        provinceId: Yup.string().required('Tỉnh thường trú là bắt buộc'),
        phoneNumber: Yup.string().required('Số điện thoại là bắt buộc').max(11, 'Số điện thoại tối đa 11 số'),
        email: Yup.string().email('Email cá nhân không hợp lệ').required('Email cá nhân là bắt buộc'),
        companyEmail: Yup.string().email('Email công ty không hợp lệ').required('Email công ty là bắt buộc'),
        recruitmentDate: Yup.date().required('Ngày vào là bắt buộc').nullable(),
        startDate: Yup.date().required('Ngày chính thức là bắt buộc').nullable(),
        apprenticeDays: Yup.number().min(0, 'Tối thiểu là 0').required('Số ngày học việc/thử việc là bắt buộc'),
        statusId: Yup.string().required('Trạng thái hồ sơ là bắt buộc'),
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
                        <Grid item xs={12} md={9}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <TextField label="Họ và tên" name="displayName" required fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <SelectInput label="Giới tính" name="gender" options={[
                                        { value: 'M', name: 'Nam' },
                                        { value: 'F', name: 'Nữ' },
                                    ]} fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <DateTimePicker label="Ngày sinh" name="birthDate" notValueMillisecond={true} required fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <SelectInput label="Tình trạng hôn nhân" name="maritalStatus" options={maritalStatusOptions} fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <TextField label="Nơi sinh" name="birthPlace" fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={4}>
                                    <SelectInput label="Quốc tịch" name="nationalityId" options={nationalityOptions} required fullWidth disabled={isView} />
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
                            <SelectInput 
                                label="Tỉnh thường trú" 
                                name="provinceId" 
                                options={provinceOptions} 
                                required 
                                onValueChange={handleProvinceChange}
                                fullWidth 
                                disabled={isView}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput 
                                label="Xã thường trú" 
                                name="administrativeunitId" 
                                options={activeWards} 
                                disabled={isView || !values.provinceId}
                                fullWidth 
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
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Số CMND" name="idNumber" fullWidth inputProps={{ maxLength: 12 }} disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <DateTimePicker label="Ngày cấp CMND" name="idNumberIssueDate" notValueMillisecond={true} fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Nơi cấp CMND" name="idNumberIssueBy" fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Số CCCD" name="personalIdentificationNumber" fullWidth inputProps={{ maxLength: 12 }} disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <DateTimePicker label="Ngày cấp CCCD" name="personalIdentificationIssueDate" notValueMillisecond={true} fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Nơi cấp CCCD" name="personalIdentificationIssuePlace" fullWidth disabled={isView} />
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
                            <TextField label="Mã nhân viên" name="staffCode" readOnly required fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Trạng thái làm việc" name="workingStatus" options={WorkingStatusOptions} required fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Trạng thái hồ sơ" name="statusId" options={statusOptions} required fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Hình thức làm việc" name="staffWorkingFormat" options={workingFormatOptions} fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
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
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <DateTimePicker label="Ngày chính thức" name="startDate" notValueMillisecond={true} required fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Email công ty" name="companyEmail" required fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Tình trạng nhân sự" name="staffPhase" options={staffPhaseOptions} fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Loại vị trí việc làm" name="staffPositionType" options={positionTypeOptions} fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Nơi mong muốn ĐKKCB" name="healthCareRegistrationPlaceId" options={healthCarePlaceOptions} fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Loại phân ca" name="staffWorkShiftType" options={shiftTypeOptions} fullWidth disabled={isView} />
                        </Grid>
                        {values.staffWorkShiftType === 'fixed' && (
                            <Grid item xs={12} sm={6} lg={3}>
                                <SelectInput label="Ca làm việc cố định" name="fixShiftWorkId" options={fixShiftWorkOptions} fullWidth disabled={isView} />
                            </Grid>
                        )}
                        <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Loại nghỉ trong tháng" name="staffLeaveShiftType" options={leaveShiftTypeOptions} fullWidth disabled={isView} />
                        </Grid>
                        {values.staffLeaveShiftType === 'fixed' && (
                            <>
                                <Grid item xs={12} sm={6} lg={3}>
                                    <SelectInput label="Ngày nghỉ cố định 1" name="fixLeaveWeekDay" options={weekDayOptions} fullWidth disabled={isView} />
                                </Grid>
                                <Grid item xs={12} sm={6} lg={3}>
                                    <SelectInput label="Ngày nghỉ cố định 2" name="fixLeaveWeekDay2" options={weekDayOptions} fullWidth disabled={isView} />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </TabAccordion>

                {/* 5. Tổ chức */}
                <TabAccordion title="Tổ chức" open={false}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Đơn vị" name="organizationId" options={organizationOptions} fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <Autocomplete 
                                label="Phòng ban" 
                                name="department" 
                                options={departments}
                                getOptionLabel={(option) => option?.name || ''}
                                fullWidth
                                disabled={isView}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <Autocomplete 
                                label="Chức danh" 
                                name="position" 
                                options={positions}
                                getOptionLabel={(option) => option?.name || ''}
                                fullWidth
                                disabled={isView}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Cấp bậc" name="level" fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SelectInput label="Chức danh khác (Title)" name="positionTitleId" options={positionTitleOptions} fullWidth disabled={isView} />
                        </Grid>
                    </Grid>
                </TabAccordion>

                {/* 6. Thông tin liên hệ */}
                <TabAccordion title="Thông tin liên hệ" open={false}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Số điện thoại" name="phoneNumber" required fullWidth disabled={isView} />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Email cá nhân" name="email" required fullWidth disabled={isView} />
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
                        <Grid item xs={12} sm={6} lg={3}>
                            <TextField label="Tình trạng sổ BHXH" name="socialInsuranceNote" fullWidth disabled={isView} />
                        </Grid>
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

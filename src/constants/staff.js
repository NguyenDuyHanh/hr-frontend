export const GENDER = {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
    OTHER: 'OTHER',
};

export const GenderOptions = [
    { value: GENDER.MALE,   name: 'Nam' },
    { value: GENDER.FEMALE, name: 'Nữ' },
    { value: GENDER.OTHER,  name: 'Khác' },
];

export const WorkingStatusOptions = [
    { value: 'PROBATION', name: 'Thử việc' },
    { value: 'ACTIVE', name: 'Đang làm việc' },
    { value: 'TEMPORARY_LEAVE', name: 'Tạm nghỉ' },
    { value: 'RESIGNED', name: 'Đã nghỉ việc' },
];

export const EducationDegreeOptions = [
    { value: 'DOCTORATE', name: 'Tiến sĩ' },
    { value: 'MASTER', name: 'Thạc sĩ' },
    { value: 'BACHELOR', name: 'Đại học' },
    { value: 'ASSOCIATE', name: 'Cao đẳng' },
    { value: 'INTERMEDIATE', name: 'Trung cấp' },
    { value: 'HIGH_SCHOOL', name: 'Trung học phổ thông' },
    { value: 'OTHER', name: 'Khác' },
];

export const QUALIFICATION_TYPE = {
    DEGREE: 'DEGREE',
    CERTIFICATE: 'CERTIFICATE',
};

export const QualificationTypeOptions = [
    { value: QUALIFICATION_TYPE.DEGREE, name: 'Bằng cấp' },
    { value: QUALIFICATION_TYPE.CERTIFICATE, name: 'Chứng chỉ' },
];

export const DegreeLevelOptions = [
    { value: 'BACHELOR', name: 'Cử nhân' },
    { value: 'ENGINEER', name: 'Kỹ sư' },
    { value: 'MASTER', name: 'Thạc sĩ' },
    { value: 'DOCTORATE', name: 'Tiến sĩ' },
    { value: 'ASSOCIATE', name: 'Cao đẳng' },
    { value: 'INTERMEDIATE', name: 'Trung cấp' },
    { value: 'OTHER', name: 'Khác' },
];

export const DegreeGradeOptions = [
    { value: 'EXCELLENT', name: 'Xuất sắc' },
    { value: 'GOOD', name: 'Giỏi' },
    { value: 'FAIR', name: 'Khá' },
    { value: 'AVERAGE_GOOD', name: 'Trung bình khá' },
    { value: 'AVERAGE', name: 'Trung bình' },
];

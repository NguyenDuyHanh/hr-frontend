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
    { value: 1, name: 'Chờ nhận việc' },
    { value: 2, name: 'Tạm dừng công việc' },
    { value: 3, name: 'Nghỉ chế độ' },
    { value: 4, name: 'Không nhận việc' },
    { value: 5, name: 'Đã nghỉ việc' },
    { value: 6, name: 'Nghỉ việc đi làm lại' },
    { value: 7, name: 'Đang làm việc' },
    { value: 8, name: 'Nghỉ không lương' },
];

export const MaritalStatusOptions = [
    { value: 'SINGLE', name: 'Độc thân' },
    { value: 'MARRIED', name: 'Đã kết hôn' },
    { value: 'DIVORCED', name: 'Ly hôn' },
    { value: 'WIDOWED', name: 'Góa' }
];

export const NationalityOptions = [
    { value: 'VN', name: 'Việt Nam' },
    { value: 'US', name: 'Mỹ' },
    { value: 'JP', name: 'Nhật Bản' },
    { value: 'KR', name: 'Hàn Quốc' },
    { value: 'CN', name: 'Trung Quốc' }
];

export const EthnicsOptions = [
    { value: 'KINH', name: 'Kinh' },
    { value: 'TAY', name: 'Tày' },
    { value: 'THAI', name: 'Thái' },
    { value: 'MUONG', name: 'Mường' },
    { value: 'KHMER', name: 'Khmer' },
    { value: 'OTHER', name: 'Khác' }
];

export const ReligionOptions = [
    { value: 'NONE', name: 'Không' },
    { value: 'BUDDHISM', name: 'Phật giáo' },
    { value: 'CATHOLICISM', name: 'Công giáo' },
    { value: 'PROTESTANTISM', name: 'Tin lành' },
    { value: 'CAODAI', name: 'Cao đài' },
    { value: 'HOAHAO', name: 'Hòa hảo' }
];

export const EducationDegreeOptions = [
    { value: 'HIGHSCHOOL', name: 'Trung học' },
    { value: 'COLLEGE', name: 'Cao đẳng' },
    { value: 'UNIVERSITY', name: 'Đại học' },
    { value: 'MASTER', name: 'Thạc sĩ' },
    { value: 'DOCTOR', name: 'Tiến sĩ' }
];

export const ProvinceOptions = [
    { value: 'HN', name: 'Hà Nội' },
    { value: 'HCM', name: 'TP. Hồ Chí Minh' },
    { value: 'DN', name: 'Đà Nẵng' },
    { value: 'HP', name: 'Hải Phòng' },
    { value: 'CT', name: 'Cần Thơ' }
];

export const WardOptionsMap = {
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

export const WorkingFormatOptions = [
    { value: 'FULLTIME', name: 'Toàn thời gian' },
    { value: 'PARTTIME', name: 'Bán thời gian' },
    { value: 'SEASONAL', name: 'Thời vụ' },
    { value: 'FREELANCE', name: 'CTV' }
];

export const StaffPhaseOptions = [
    { value: 'APPRENTICE', name: 'Học việc' },
    { value: 'PROBATION', name: 'Thử việc' },
    { value: 'OFFICIAL', name: 'Chính thức' }
];

export const PositionTypeOptions = [
    { value: 'MANAGER', name: 'Nhà quản lý' },
    { value: 'SPECIALIST', name: 'Chuyên môn kỹ thuật' },
    { value: 'STAFF', name: 'Nhân viên nghiệp vụ' },
    { value: 'OTHER', name: 'Khác' }
];

export const ShiftTypeOptions = [
    { value: 'FIXED', name: 'Cố định' },
    { value: 'FLEXIBLE', name: 'Linh hoạt' }
];

export const FixShiftWorkOptions = [
    { value: 'HC', name: 'Ca hành chính (8h-17h)' },
    { value: 'MORNING', name: 'Ca sáng (6h-14h)' },
    { value: 'AFTERNOON', name: 'Ca chiều (14h-22h)' }
];

export const LeaveShiftTypeOptions = [
    { value: 'FIXED', name: 'Nghỉ cố định' },
    { value: 'FLEXIBLE', name: 'Nghỉ linh hoạt' }
];

export const WeekDayOptions = [
    { value: 'MONDAY', name: 'Thứ 2' },
    { value: 'TUESDAY', name: 'Thứ 3' },
    { value: 'WEDNESDAY', name: 'Thứ 4' },
    { value: 'THURSDAY', name: 'Thứ 5' },
    { value: 'FRIDAY', name: 'Thứ 6' },
    { value: 'SATURDAY', name: 'Thứ 7' },
    { value: 'SUNDAY', name: 'Chủ Nhật' }
];

export const OrganizationOptions = [
    { value: 'CORP', name: 'Công ty Cổ phần HRM' },
    { value: 'NORTH_BRANCH', name: 'Chi nhánh Miền Bắc' },
    { value: 'SOUTH_BRANCH', name: 'Chi nhánh Miền Nam' }
];

export const HealthCarePlaceOptions = [
    { value: 'BM', name: 'Bệnh viện Bạch Mai' },
    { value: 'XP', name: 'Bệnh viện Xanh Pôn' },
    { value: 'CR', name: 'Bệnh viện Chợ Rẫy' }
];

export const StatusOptions = [
    { value: 'ACTIVE', name: 'Đang làm việc' },
    { value: 'INACTIVE', name: 'Đã nghỉ việc' },
    { value: 'SUSPENDED', name: 'Tạm đình chỉ' }
];

export const PositionTitleOptions = [
    { value: 'DIRECTOR', name: 'Giám đốc' },
    { value: 'MANAGER', name: 'Trưởng phòng' },
    { value: 'TEAMLEAD', name: 'Trưởng nhóm' },
    { value: 'STAFF', name: 'Nhân viên' }
];

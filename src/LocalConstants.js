export const SystemConfigCode = {
    // Standard system configuration codes
    API_ENPOINT: "API_ENPOINT",
    AUTH_MODE: "AUTH_MODE",
};

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

const LocalConstants = {
    SystemConfigCode,
    WorkingStatusOptions
};

export default LocalConstants;

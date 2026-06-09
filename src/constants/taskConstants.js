export const TASK_PRIORITY = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    URGENT: 4
};

export const TASK_PRIORITY_LABELS = {
    1: 'Thấp',
    2: 'Trung bình',
    3: 'Cao',
    4: 'Cấp bách'
};

export const TASK_PRIORITY_OPTIONS = [
    { value: 1, label: 'Thấp' },
    { value: 2, label: 'Trung bình' },
    { value: 3, label: 'Cao' },
    { value: 4, label: 'Cấp bách' }
];

export const TASK_PRIORITY_COLORS = {
    1: '#4caf50', // Green
    2: '#2196f3', // Blue
    3: '#ff9800', // Orange
    4: '#f44336'  // Red
};

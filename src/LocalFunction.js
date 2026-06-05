/**
 * High-performance UI Utility Functions
 */

/**
 * Calculate total pages for pagination
 */
export const calculateTotalPages = (totalElements, pageSize) => {
    if (!totalElements || totalElements <= 0 || !pageSize || pageSize <= 0) {
        return 0;
    }
    return Math.ceil(totalElements / pageSize);
};

/**
 * Check if string contains only numbers
 */
export function containsOnlyNumbers(str) {
    if (typeof str !== 'string' && typeof str !== 'number') return false;
    return /^\d+$/.test(String(str));
}
/**
 * Generate a persistent incremental staff code (NVddMM_XXXX)
 */
/**
 * Get the next staff code for preview (without incrementing localStorage)
 */
export const getNextStaffCode = () => {
    const now = new Date();
    const dayMonth = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const storageKey = `staff_counter_${dayMonth}`;
    
    let lastCounter = parseInt(localStorage.getItem(storageKey) || '0');
    const nextCounter = lastCounter + 1;
    const counterStr = String(nextCounter).padStart(4, '0');
    
    return `NV${dayMonth}_${counterStr}`;
};

/**
 * Increment and save the staff code counter to localStorage
 */
export const incrementStaffCode = () => {
    const now = new Date();
    const dayMonth = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const storageKey = `staff_counter_${dayMonth}`;
    
    let lastCounter = parseInt(localStorage.getItem(storageKey) || '0');
    localStorage.setItem(storageKey, (lastCounter + 1).toString());
};

/**
 * Get label from options array based on value
 */
export const getLabelFromOptions = (options, value) => {
    if (!options || !Array.isArray(options)) return value;
    const option = options.find(opt => String(opt.value) === String(value));
    return option ? (option.label || option.name) : value;
};

/**
 * Count active filters in a filter object generically
 */
export const getActiveFilterCount = (filters) => {
    if (!filters || typeof filters !== 'object') return 0;
    return Object.values(filters).filter(value => {
        if (value === null || value === undefined || value === '') return false;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object') {
            if (value.id !== undefined) return value.id !== null && value.id !== '';
            if (value.value !== undefined) return value.value !== null && value.value !== '';
            return Object.keys(value).length > 0;
        }
        return true;
    }).length;
};

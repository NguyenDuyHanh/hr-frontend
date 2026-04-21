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

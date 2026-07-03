import { create } from 'zustand';
import {
    getAllPayrolls,
    calculatePayroll,
    getPayrollDetails,
    confirmPayroll,
    unconfirmPayroll,
    deletePayroll,
    updatePayslip,
    getMyPayslip,
    createPayroll,
    getPayrollsByPeriod
} from '../services/payrollService';

const usePayrollStore = create((set, get) => ({
    allPayrolls: [],
    payrollStaffs: [],
    myPayslip: null,
    loading: false,
    calculating: false,
    confirming: false,
    deleting: false,
    updating: false,
    creating: false,

    createPayrollAction: async (periodId, name, code, description) => {
        set({ creating: true });
        try {
            const response = await createPayroll(periodId, name, code, description);
            await get().loadAllPayrolls();
            return response;
        } catch (error) {
            console.error('Error creating payroll:', error);
            throw error;
        } finally {
            set({ creating: false });
        }
    },

    loadAllPayrolls: async (periodId) => {
        set({ loading: true });
        try {
            const response = periodId
                ? await getPayrollsByPeriod(periodId)
                : await getAllPayrolls();
            const dataList = Array.isArray(response?.data?.data)
                ? response.data.data
                : Array.isArray(response?.data) ? response.data : [];
            set({ allPayrolls: dataList, loading: false });
        } catch (error) {
            console.error('Error loading payrolls:', error);
            set({ loading: false });
        }
    },

    loadPayrollDetails: async (payrollId) => {
        if (!payrollId) return;
        set({ loading: true });
        try {
            const response = await getPayrollDetails(payrollId);
            const dataList = Array.isArray(response?.data?.data)
                ? response.data.data
                : Array.isArray(response?.data) ? response.data : [];
            set({ payrollStaffs: dataList, loading: false });
        } catch (error) {
            console.error('Error loading payroll details:', error);
            set({ loading: false });
        }
    },

    recalculatePayroll: async (payrollId) => {
        if (!payrollId) return;
        set({ calculating: true });
        try {
            await calculatePayroll(payrollId);
            await get().loadPayrollDetails(payrollId);
        } catch (error) {
            console.error('Error recalculating payroll:', error);
            throw error;
        } finally {
            set({ calculating: false });
        }
    },

    confirmPayroll: async (payrollId) => {
        if (!payrollId) return;
        set({ confirming: true });
        try {
            await confirmPayroll(payrollId);
            await get().loadAllPayrolls();
            await get().loadPayrollDetails(payrollId);
        } catch (error) {
            console.error('Error confirming payroll:', error);
            throw error;
        } finally {
            set({ confirming: false });
        }
    },

    unconfirmPayroll: async (payrollId) => {
        if (!payrollId) return;
        set({ confirming: true });
        try {
            await unconfirmPayroll(payrollId);
            await get().loadAllPayrolls();
            await get().loadPayrollDetails(payrollId);
        } catch (error) {
            console.error('Error unconfirming payroll:', error);
            throw error;
        } finally {
            set({ confirming: false });
        }
    },

    deletePayroll: async (payrollId) => {
        if (!payrollId) return;
        set({ deleting: true });
        try {
            await deletePayroll(payrollId);
        } catch (error) {
            console.error('Error deleting payroll:', error);
            throw error;
        } finally {
            set({ deleting: false });
        }
    },

    updatePayslipStatus: async (payslipId, paidStatus, note) => {
        set({ updating: true });
        try {
            const response = await updatePayslip(payslipId, paidStatus, note);
            if (response?.data) {
                // Update in the local list
                const updatedList = get().payrollStaffs.map(p =>
                    p.id === payslipId ? { ...p, paidStatus, note } : p
                );
                set({ payrollStaffs: updatedList });
            }
            return response;
        } catch (error) {
            console.error('Error updating payslip status:', error);
            throw error;
        } finally {
            set({ updating: false });
        }
    },

    loadMyPayslip: async (periodId) => {
        if (!periodId) return;
        set({ loading: true, myPayslip: null });
        try {
            const response = await getMyPayslip(periodId);
            const data = response?.data?.data || response?.data || null;
            set({ myPayslip: data, loading: false });
        } catch (error) {
            console.error('Error loading my payslip:', error);
            set({ loading: false });
            throw error;
        }
    }
}));

export default usePayrollStore;

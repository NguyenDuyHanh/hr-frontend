import { create } from 'zustand';
import { getDashboardSummary } from '../services/dashboardService';
import { approveLeaveRequest, rejectLeaveRequest } from '../services/leaveService';
import { toast } from 'sonner';

const useDashboardStore = create((set, get) => ({
    summary: null,
    loading: false,
    error: null,

    fetchSummary: async () => {
        set({ loading: true, error: null });
        try {
            const response = await getDashboardSummary();
            if (response && response.status === 200) {
                set({ summary: response.data, loading: false });
            } else {
                set({ error: response?.message || 'Có lỗi xảy ra khi lấy dữ liệu dashboard', loading: false });
            }
        } catch (error) {
            console.error('Error loading dashboard summary:', error);
            set({ error: error?.message || 'Có lỗi xảy ra', loading: false });
        }
    },

    quickApproveLeave: async (id) => {
        try {
            const response = await approveLeaveRequest(id);
            if (response && response.status === 200) {
                toast.success('Phê duyệt đơn nghỉ phép thành công');
                // Reload dashboard data
                get().fetchSummary();
                return true;
            } else {
                toast.error(response?.message || 'Không thể phê duyệt đơn nghỉ phép');
                return false;
            }
        } catch (error) {
            console.error('Error quick approving leave:', error);
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra');
            return false;
        }
    },

    quickRejectLeave: async (id, reason) => {
        try {
            const response = await rejectLeaveRequest(id, reason);
            if (response && response.status === 200) {
                toast.success('Từ chối đơn nghỉ phép thành công');
                // Reload dashboard data
                get().fetchSummary();
                return true;
            } else {
                toast.error(response?.message || 'Không thể từ chối đơn nghỉ phép');
                return false;
            }
        } catch (error) {
            console.error('Error quick rejecting leave:', error);
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra');
            return false;
        }
    }
}));

export default useDashboardStore;

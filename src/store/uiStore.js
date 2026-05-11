import { create } from 'zustand';

const MIN_DURATION = 400; // ms

const useUiStore = create((set, get) => ({
    apiCount: 0,
    showLoading: false, 
    startTime: 0,
    
    startLoading: () => {
        const now = Date.now();
        const currentCount = get().apiCount;
        
        // Nếu là request đầu tiên của chuỗi
        if (currentCount === 0) {
            set({ startTime: now, showLoading: true });
        }
        
        set({ apiCount: currentCount + 1 });
    },

    stopLoading: async () => {
        const newCount = Math.max(0, get().apiCount - 1);
        set({ apiCount: newCount });

        // CHỈ xử lý tắt vòng xoay trung tâm khi KHÔNG CÒN bất kỳ API nào đang chạy
        if (newCount === 0) {
            const elapsed = Date.now() - get().startTime;
            if (elapsed < MIN_DURATION) {
                await new Promise(resolve => setTimeout(resolve, MIN_DURATION - elapsed));
            }
            set({ showLoading: false });
        }
    },
}));

export default useUiStore;

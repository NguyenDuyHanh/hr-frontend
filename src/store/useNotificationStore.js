import { create } from 'zustand';
import * as notificationService from '../services/notificationService';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  activeFilter: 'ALL',

  fetchNotifications: async (searchDto = {}) => {
    set({ loading: true });
    try {
      const { activeFilter } = get();
      const params = {
        pageIndex: 1,
        pageSize: 20,
        ...searchDto,
      };
      if (activeFilter && activeFilter !== 'ALL') {
        params.notificationType = activeFilter;
      }
      
      const response = await notificationService.pagingNotifications(params);
      console.log('[WS Store] Response from pagingNotifications:', response);
      if (response && (response.status === 200 || response.status === 201)) {
        set({ 
          notifications: response.data.content || [], 
          loading: false 
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      set({ loading: false });
    }
  },

  setActiveFilter: async (filter) => {
    set({ activeFilter: filter });
    await get().fetchNotifications({ pageIndex: 1, pageSize: 20 });
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response && (response.status === 200 || response.status === 201)) {
        set({ unreadCount: response.data });
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  },

  markRead: async (id) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response && (response.status === 200 || response.status === 201)) {
        // Cập nhật trạng thái trong store
        const { notifications, unreadCount } = get();
        const updated = notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        );
        set({ 
          notifications: updated,
          unreadCount: Math.max(0, unreadCount - 1)
        });
      }
    } catch (err) {
      console.error(`Failed to mark notification ${id} as read:`, err);
    }
  },

  markAllRead: async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response && (response.status === 200 || response.status === 201)) {
        // Cập nhật trạng thái trong store
        const { notifications } = get();
        const updated = notifications.map(n => ({ ...n, isRead: true }));
        set({ 
          notifications: updated,
          unreadCount: 0
        });
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  },

  addNotification: (noti) => {
    const { notifications, unreadCount, activeFilter } = get();
    // Thêm thông báo mới vào đầu mảng nếu phù hợp bộ lọc hiện tại
    let newNotifications = notifications;
    if (activeFilter === 'ALL' || noti.notificationType === activeFilter) {
      newNotifications = [{ ...noti, isRead: false }, ...notifications].slice(0, 50);
    }
    set({ 
      notifications: newNotifications,
      unreadCount: unreadCount + 1
    });
  }
}));

export default useNotificationStore;

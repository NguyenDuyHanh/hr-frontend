import { useState, useEffect } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { getProjectById } from '@/services/projectService';
import localStorageService from '@/services/localStorageService';

/**
 * Custom Hook kiểm tra quyền hạn của User đối với một Dự án cụ thể.
 * Hỗ trợ check cả quyền Hệ thống (Admin/HR_MANAGER) và quyền Dự án (MANAGER/MEMBER).
 * 
 * @param {string|object} projectOrId - ID của dự án (chuỗi UUID) hoặc object thông tin chi tiết dự án (chứa thuộc tính staffs).
 * @returns {object} { isProjectManager, isProjectMember, loading }
 */
export const useProjectPermission = (projectOrId) => {
  const user = useAuthStore((state) => state.user);

  const [isProjectManager, setIsProjectManager] = useState(false);
  const [isProjectMember, setIsProjectMember] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkStaffRole = (staffsList) => {
    const list = staffsList || [];
    const currentStaffId = user?.staffId;
    
    if (!currentStaffId) return { isManager: false, isMember: false };

    const isManager = list.some(
      (s) => s.staffId === currentStaffId && s.projectRole === 'MANAGER'
    );
    const isMember = list.some(
      (s) => s.staffId === currentStaffId
    );

    return { isManager, isMember };
  };

  // Helper tìm project trong localStorage để tránh gọi API lặp lại
  const getProjectFromLocalStorage = (id) => {
    if (!id) return null;
    const username = user?.username || '';
    const projectKey = username ? `task_filter_project_${username}` : 'task_filter_project';
    const savedProject = localStorageService.getItem(projectKey);
    if (savedProject && typeof savedProject === 'object' && savedProject.id === id) {
      return savedProject;
    }
    return null;
  };

  // Check synchronously if projectOrId is already loaded as an object or in localStorage
  let isObject = typeof projectOrId === 'object' && projectOrId !== null;
  let projectObj = isObject ? projectOrId : null;

  if (!isObject && typeof projectOrId === 'string') {
    const saved = getProjectFromLocalStorage(projectOrId);
    if (saved) {
      projectObj = saved;
      isObject = true;
    }
  }

  const syncRoles = isObject ? checkStaffRole(projectObj.staffs) : null;

  useEffect(() => {
    if (isObject || !projectOrId) {
      return;
    }

    // Trường hợp 2: projectOrId chỉ là projectId (chuỗi UUID) và không tìm thấy ở localStorage
    const fetchProjectAndCheck = async () => {
      setLoading(true);
      try {
        const res = await getProjectById(projectOrId);
        const project = res?.data;
        const { isManager, isMember } = checkStaffRole(project?.staffs);
        setIsProjectManager(isManager);
        setIsProjectMember(isMember);
      } catch (error) {
        console.error('Lỗi khi kiểm tra quyền hạn dự án:', error);
        setIsProjectManager(false);
        setIsProjectMember(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndCheck();
  }, [projectOrId, user?.staffId, isObject]);

  return {
    isProjectManager: isObject ? syncRoles.isManager : isProjectManager,
    isProjectMember: isObject ? syncRoles.isMember : isProjectMember,
    loading,
  };
};

export default useProjectPermission;

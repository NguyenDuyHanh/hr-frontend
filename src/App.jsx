import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import 'nprogress/nprogress.css';
import { Toaster } from 'sonner';

import MainLayout from "./layout/MainLayout";
import AuthGuard from "./components/auth/AuthGuard";
import { navigations } from "./navigationConfig";
import StaffList from "./pages/Staff/StaffList";
import UserList from "./pages/User/UserList";
import StaffDetailPage from "./pages/Staff/StaffDetailPage";
import ProjectList from "./pages/Project/ProjectList";
import ProjectDetail from "./pages/Project/ProjectDetail";
import TaskList from "./pages/Task/TaskList";
import RecruitmentList from "./pages/Recruitment/RecruitmentList";
import RecruitmentDetail from "./pages/Recruitment/RecruitmentDetail";
import TimekeepingCalendar from "./pages/Timekeeping/TimekeepingCalendar";
import TimekeepingSummary from "./pages/Timekeeping/TimekeepingSummary";
import TimesheetApprovalList from "./pages/Timesheet/TimesheetApprovalList";
import useUiStore from "./store/uiStore";
import Loading from "./components/ui/Loading";
import GlobalLoadingHandler from "./components/common/GlobalLoadingHandler";
import AiChatbotWidget from "./components/ui/AiChatbotWidget";
import LoginPage from "./pages/auth/LoginPage";
import { setNavigate } from "./navigation";
import { ROLES } from "./constants/roles";

// Placeholder component for pages
const PagePlaceholder = ({ title }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-[400px] flex flex-col items-center justify-center text-center">
    <div className="mb-4 p-4 rounded-full bg-primary/5 text-primary">
      <h2 className="text-2xl font-semibold uppercase tracking-wider">{title}</h2>
    </div>
    <div className="w-20 h-1 bg-secondary rounded-full mb-6"></div>
    <p className="text-gray-400 italic">Trang này đang được phát triển trong hệ thống HRM mới...</p>
    <p className="text-xs text-gray-300 mt-4">Path: {window.location.pathname}</p>
  </div>
);

// Real LoginPage is imported above

function App() {
  const navigate = useNavigate();
  
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  const showLoading = useUiStore(state => state.showLoading);

  // Hàm làm phẳng danh sách menu để tạo Route tự động
  const flattenNavigations = (items) => {
    let flat = [];
    items.forEach(item => {
      if (item.path && !item.external) {
        flat.push(item);
      }
      if (item.children) {
        flat = [...flat, ...flattenNavigations(item.children)];
      }
    });
    return flat;
  };

  const allRoutes = flattenNavigations(navigations);

  // Map các component đặc biệt
  const componentMap = {
    "/dashboard": <PagePlaceholder title="Bảng điều khiển" />,
    "/staff/all": <StaffList />,
    "/administration/accounts": <UserList />,
    "/projects": <ProjectList />,
    "/tasks": <TaskList />,
    "/recruitments": <RecruitmentList />,
    "/time-sheet-detail": <TimekeepingCalendar />,
    "/check-inout-result": <TimesheetApprovalList />,
    "/time-sheet-summary": <TimekeepingSummary />,
  };

  return (
    <>
      <Toaster position="bottom-right" richColors closeButton />

      {/* Người quan sát điều khiển thanh NProgress */}
      <GlobalLoadingHandler />
      
      {/* Vòng xoay trung tâm điều khiển bởi showLoading */}
      {showLoading && <Loading fixed />}
      
      {/* Widget Trợ lý AI */}
      <AiChatbotWidget />

      <Routes>
        {/* Route công khai (Public) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Routes được bảo vệ (Protected) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Tự động tạo Route từ cấu hình Menu */}
          {allRoutes.map((route, index) => (
            <Route 
              key={index} 
              path={route.path} 
              element={
                <AuthGuard roles={route.auth}>
                  {componentMap[route.path] || <PagePlaceholder title={route.name} />}
                </AuthGuard>
              } 
            />
          ))}

          {/* Route chi tiết nhân viên (Staff Detail/Edit) */}
          <Route 
            path="/staff/:id" 
            element={
              <AuthGuard roles={[ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.HR_EMPLOYEE]}>
                <StaffDetailPage />
              </AuthGuard>
            } 
          />

          {/* Route chi tiết dự án - chế độ xem */}
          <Route 
            path="/projects/:id/view" 
            element={
              <AuthGuard roles={[ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.HR_EMPLOYEE]}>
                <ProjectDetail />
              </AuthGuard>
            } 
          />

          {/* Route chi tiết dự án - chế độ sửa */}
          <Route 
            path="/projects/:id/edit" 
            element={
              <AuthGuard roles={[ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.HR_EMPLOYEE]}>
                <ProjectDetail />
              </AuthGuard>
            } 
          />

          {/* Route chi tiết tin tuyển dụng - chế độ xem */}
          <Route 
            path="/recruitments/:id/view" 
            element={
              <AuthGuard roles={[ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.HR_RECRUITMENT]}>
                <RecruitmentDetail />
              </AuthGuard>
            } 
          />

          {/* Route chi tiết tin tuyển dụng - chế độ sửa */}
          <Route 
            path="/recruitments/:id/edit" 
            element={
              <AuthGuard roles={[ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.HR_RECRUITMENT]}>
                <RecruitmentDetail />
              </AuthGuard>
            } 
          />

{/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

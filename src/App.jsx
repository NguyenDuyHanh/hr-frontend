import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import 'nprogress/nprogress.css';
import { Toaster } from 'sonner';

import MainLayout from "./layout/MainLayout";
import AuthGuard from "./components/auth/AuthGuard";
import { navigations } from "./navigationConfig";
import useAuthStore from "./store/useAuthStore";
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
import SalaryItemPage from "./pages/Salary/SalaryItemPage";
import SalaryPeriodPage from "./pages/Salary/SalaryPeriodPage";
import PayrollListPage from "./pages/Salary/PayrollListPage";
import PayrollDetailPage from "./pages/Salary/PayrollDetailPage";
import StaffPayslipPage from "./pages/Salary/StaffPayslipPage";
import LeaveRequestList from "./pages/Leave/LeaveRequestList";
import MyLeaveRequests from "./pages/Leave/MyLeaveRequests";
import LeaveBalance from "./pages/Leave/LeaveBalance";
import DepartmentPage from "./pages/Department/DepartmentPage";
import PositionPage from "./pages/Position/PositionPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";

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

const RootRedirect = () => {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  const isAdmin = user.role?.includes(ROLES.ADMIN);
  return <Navigate to={isAdmin ? "/dashboard" : "/profile-page/home"} replace />;
};

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
    "/dashboard": <DashboardPage />,
    "/staff/all": <StaffList />,

    "/administration/accounts": <UserList />,
    "/projects": <ProjectList />,
    "/tasks": <TaskList />,
    "/recruitments": <RecruitmentList />,
    "/time-sheet-detail": <TimekeepingCalendar />,
    "/check-inout-result": <TimesheetApprovalList />,
    "/time-sheet-summary": <TimekeepingSummary />,
    "/salary/salary-item": <SalaryItemPage />,
    "/salary/salary-period": <SalaryPeriodPage />,
    "/salary/payrolls": <PayrollListPage />,
    "/salary/salary-staff-payslip": <StaffPayslipPage />,
    "/leave-requests": <LeaveRequestList />,
    "/my-leave": <MyLeaveRequests />,
    "/leave-balance": <LeaveBalance />,
    "/department": <DepartmentPage />,
    "/category/staff/position": <PositionPage />,
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
          <Route path="/" element={<RootRedirect />} />
          
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

          {/* Route chi tiết bảng lương */}
          <Route 
            path="/salary/payrolls/:id" 
            element={
              <AuthGuard roles={[ROLES.ADMIN, ROLES.HR_COMPENSATION_BENEFIT]}>
                <PayrollDetailPage />
              </AuthGuard>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<RootRedirect />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

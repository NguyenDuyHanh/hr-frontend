import { useEffect, useRef } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { connectWebSocket, disconnectWebSocket } from "./services/websocketService";
import useNotificationStore from "./store/useNotificationStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
import AiChatbotWidget from "./components/ui/AiChatbotWidget";
import LoginPage from "./pages/auth/LoginPage";
import { setNavigate } from "./navigation";
import { ROLES } from "./constants/roles";
import SalaryItemPage from "./pages/Salary/SalaryItemPage";
import StaffSalaryConfigList from "./pages/Salary/StaffSalaryConfigList";
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
import HomePage from "./pages/Home/HomePage";
import HolidayPage from "./pages/Holiday/HolidayPage";
import RolePage from "./pages/Role/RolePage";
import AnnouncementsPage from "./pages/Annoucement/AnnouncementsPage";
import AnnouncementsGridPage from "./pages/Annoucement/AnnouncementsGridPage";
import EthnicPage from "./pages/Category/Ethnic/EthnicPage";
import BankPage from "./pages/Category/Bank/BankPage";
import AdministrativeUnitPage from "./pages/Category/AdministrativeUnit/AdministrativeUnitPage";

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
  const userRoles = user.role || [];
  const canViewDashboard = userRoles.includes(ROLES.ADMIN);
  return <Navigate to={canViewDashboard ? "/dashboard" : "/home"} replace />;
};

function App() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);
  
  const navigateRef = useRef(navigate);
  
  useEffect(() => {
    navigateRef.current = navigate;
    setNavigate(navigate);
  }, [navigate]);

  useEffect(() => {
    if (accessToken && user) {
      connectWebSocket(accessToken, (newNoti) => {
        addNotification(newNoti);
        
        try {
          const audio = new Audio('/notification.mp3');
          audio.play();
        } catch (e) {
          console.warn('Failed to play notification sound:', e);
        }

        toast.info(
          <div className="flex flex-col gap-1 cursor-pointer" onClick={() => {
            if (newNoti.linkUrl) {
              const url = newNoti.linkUrl.startsWith('/') ? newNoti.linkUrl : `/${newNoti.linkUrl}`;
              navigateRef.current(url);
            }
          }}>
            <div className="font-bold text-[13px]">{newNoti.title}</div>
            <div className="text-[11px] text-gray-500 leading-normal">{newNoti.content}</div>
          </div>,
          {
            duration: 5000,
          }
        );
      });

      fetchUnreadCount();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [accessToken, user?.username]);

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
    "/home": <HomePage />,
    "/announcements": <AnnouncementsGridPage />,
    "/administration/announcements": <AnnouncementsPage />,
    "/dashboard": <DashboardPage />,
    "/staff/all": <StaffList />,

    "/administration/accounts": <UserList />,
    "/projects": <ProjectList />,
    "/tasks": <TaskList />,
    "/recruitments": <RecruitmentList />,
    "/time-sheet-detail": <TimekeepingCalendar />,
    "/check-inout-result": <TimesheetApprovalList />,
    "/time-sheet-summary": <TimekeepingSummary />,
    "/holidays": <HolidayPage />,
    "/salary/salary-item": <SalaryItemPage />,
    "/salary/staff-salary-config": <StaffSalaryConfigList />,
    "/salary/salary-period": <SalaryPeriodPage />,
    "/salary/payrolls": <PayrollListPage />,
    "/salary/salary-staff-payslip": <StaffPayslipPage />,
    "/leave-requests": <LeaveRequestList />,
    "/my-leave": <MyLeaveRequests />,
    "/leave-balance": <LeaveBalance />,
    "/department": <DepartmentPage />,
    "/category/staff/position": <PositionPage />,
    "/administration/roles": <RolePage />,
    "/category/bank": <BankPage />,
    "/category/ethnic": <EthnicPage />,
    "/category/administrative-unit": <AdministrativeUnitPage />,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="bottom-right" richColors closeButton />
      
      {/* Widget Trợ lý AI */}
      {user && <AiChatbotWidget />}

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

          {/* Route trang cá nhân */}
          <Route 
            path="/profile" 
            element={
              <AuthGuard>
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
      <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;

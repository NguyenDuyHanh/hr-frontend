import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import TestComponents from "./pages/TestComponents";
import AuthGuard from "./components/auth/AuthGuard";
import { navigations } from "./navigationConfig";
import StaffList from "./pages/Staff/StaffList";
import UserList from "./pages/User/UserList";
import useUiStore from "./store/uiStore";
import UiLoading from "./components/ui/UiLoading";
import 'nprogress/nprogress.css';
import GlobalLoadingHandler from "./components/common/GlobalLoadingHandler";

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

// Login Placeholder
const LoginPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
      <h1 className="text-2xl font-bold mb-6 text-primary">HRM Login</h1>
      <p className="text-gray-600 mb-8">Trang đăng nhập đang được xây dựng...</p>
      <div className="p-4 bg-blue-50 text-blue-700 rounded-lg text-sm italic">
        (Hệ thống đang sử dụng tài khoản Admin mặc định để test)
      </div>
    </div>
  </div>
);

function App() {
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
    "/test": <TestComponents />,
    "/dashboard": <PagePlaceholder title="Bảng điều khiển" />,
    "/staff/all": <StaffList />,
    "/administration/accounts": <UserList />,
  };

  return (
    <>
      {/* Người quan sát điều khiển thanh NProgress */}
      <GlobalLoadingHandler />
      
      {/* Vòng xoay trung tâm điều khiển bởi showLoading */}
      {showLoading && <UiLoading fixed />}

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

          {/* Route Test không cần auth */}
          <Route path="/test" element={<TestComponents />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

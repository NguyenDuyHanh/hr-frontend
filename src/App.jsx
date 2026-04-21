import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import TestComponents from "./pages/TestComponents";

// Placeholder component for pages
const PagePlaceholder = ({ title }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-[400px] flex flex-col items-center justify-center text-center">
    <h2 className="text-2xl font-medium text-primary mb-2 uppercase">{title}</h2>
    <div className="w-16 h-1 bg-secondary rounded-full mb-6"></div>
    <p className="text-gray-400">Trang này đang được phát triển...</p>
  </div>
);

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<PagePlaceholder title="Bảng điều khiển (Dashboard)" />} />

        {/* Nhân viên */}
        <Route path="/employee/list" element={<PagePlaceholder title="Danh sách nhân viên" />} />
        <Route path="/employee/add" element={<PagePlaceholder title="Thêm mới nhân viên" />} />

        {/* Chấm công */}
        <Route path="/timesheet" element={<PagePlaceholder title="Chấm công" />} />
        <Route path="/timesheet/shift" element={<PagePlaceholder title="Bảng phân ca" />} />
        <Route path="/timesheet/statistics" element={<PagePlaceholder title="Thống kê công" />} />
        <Route path="/timesheet/board" element={<PagePlaceholder title="Bảng chấm công" />} />
        <Route path="/timesheet/device" element={<PagePlaceholder title="Thiết bị chấm công" />} />
        <Route path="/timesheet/overtime" element={<PagePlaceholder title="Xác nhận làm thêm giờ" />} />
        <Route path="/timesheet/leave" element={<PagePlaceholder title="Yêu cầu nghỉ phép" />} />
        <Route path="/timesheet/result" element={<PagePlaceholder title="Xác nhận kết quả" />} />

        {/* Lương thưởng */}
        <Route path="/salary/list" element={<PagePlaceholder title="Bảng lương" />} />
        <Route path="/salary/bonus" element={<PagePlaceholder title="Thưởng" />} />

        {/* Bảo hiểm */}
        <Route path="/insurance/social" element={<PagePlaceholder title="Bảo hiểm xã hội" />} />
        <Route path="/insurance/health" element={<PagePlaceholder title="Bảo hiểm y tế" />} />

        {/* Cá nhân */}
        <Route path="/personal/info" element={<PagePlaceholder title="Thông tin cá nhân" />} />

        {/* Công việc */}
        <Route path="/work/list" element={<PagePlaceholder title="Danh sách công việc" />} />
        
        {/* Test Components */}
        <Route path="/test" element={<TestComponents />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default App;

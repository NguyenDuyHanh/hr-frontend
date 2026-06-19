import { ROLES } from "./constants/roles";

const {
  ADMIN,
  HR_MANAGER,
  HR_EMPLOYEE,
  HR_RECRUITMENT,
  HR_COMPENSATION_BENEFIT,
  HR_TIMEKEEPING_MANAGER,
} = ROLES;

const ALL_ROLES = Object.values(ROLES);

export const navigations = [
  {
    name: "Trang chủ",
    path: "/dashboard",
    icon: "home",
    auth: ALL_ROLES,
    children: [
      { name: "Bảng tin", path: "/profile-page/home", auth: ALL_ROLES },
      // { name: "Đánh giá", path: "/profile-page/available-evaluations", auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE] },
      // { name: "Công việc của tôi", path: "/profile-page/my-work", auth: ALL_ROLES },
      // { name: "Email", path: "/email", auth: [ADMIN] },
      // { name: "Diễn đàn", path: "/forum/forum-group", auth: [ADMIN] },
      { name: "Thông báo", path: "/announcement/announcement", auth: [ADMIN, HR_MANAGER] },
    ]
  },
  {
    name: "Cơ cấu tổ chức",
    icon: "account_tree",
    auth: [ADMIN, HR_MANAGER],
    children: [
      // { name: "Sơ đồ tổ chức", path: "/organization/diagram", auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE] },
      // { name: "Cây tổ chức", path: "/organization/tree", auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE] },
      { name: "Phòng ban", path: "/department", auth: [ADMIN, HR_MANAGER] },
      { name: "Quản lý vị trí", path: "/category/staff/position", auth: [ADMIN, HR_MANAGER] },
      // { name: "Nhóm ngạch", path: "/organization/group-position-title", auth: [ADMIN, HR_MANAGER] },
      // { name: "Ngạch lương", path: "/organization/rank-title", auth: [ADMIN, HR_MANAGER] },
      // { name: "Chức danh", path: "/organization/position-title", auth: [ADMIN, HR_MANAGER] },
    ],
  },
  {
    name: "Tuyển dụng",
    icon: "vertical_split",
    auth: [ADMIN, HR_MANAGER, HR_RECRUITMENT],
    children: [
      { name: "Tin tuyển dụng", path: "/recruitments", auth: [ADMIN, HR_MANAGER, HR_RECRUITMENT] },
    ],
  },
  {
    name: "Nhân viên",
    icon: "people",
    auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE],
    children: [
      { name: "Hồ sơ nhân viên", path: "/staff/all", auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE] },
      // { name: "Phiếu đánh giá", path: "/staff-evaluation-ticket", auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE] },
      { name: "Hợp đồng lao động", path: "/staff-labour-agreement", auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE] },
      { name: "Quản lý phép năm", path: "/staff-annual-leave-history", auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE] },
      // { name: "Chứng chỉ nhân viên", path: "/staff-certificate", auth: [ADMIN, HR_MANAGER] },
      // {
      //   name: "Danh mục nhân sự",
      //   auth: [ADMIN, HR_MANAGER],
      //   children: [
      //     { name: "Loại nhân viên", path: "/category/staff/staff-type" },
      //     { name: "Khen thưởng/Kỷ luật", path: "/category/staff/reward" },
      //     { name: "Lý do nghỉ việc", path: "/category/staff/leaving-job-reason" },
      //     { name: "Loại hợp đồng", path: "/category/staff/contract-type" },
      //     { name: "Quan hệ gia đình", path: "/category/familyRelationship" },
      //   ]
      // }
    ],
  },
  {
    name: "Chấm công",
    icon: "access_time",
    auth: [ADMIN, HR_MANAGER, HR_TIMEKEEPING_MANAGER, HR_EMPLOYEE],
    children: [
      { name: "Chi tiết chấm công", path: "/time-sheet-detail", auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE] },
      // { name: "Ca làm việc", path: "/category/shift-work", auth: [ADMIN, HR_MANAGER, HR_TIMEKEEPING_MANAGER] },
      // { name: "Phân công lịch trực", path: "/staff-work-schedule", auth: [ADMIN, HR_MANAGER] },
      // { name: "Bảng phân ca", path: "/work-schedule-calendar", auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE] },
      // { name: "Thiết bị chấm công", path: "/timekeeping-device", auth: [ADMIN, HR_MANAGER] },
      // { name: "Yêu cầu làm thêm", path: "/category/overtime-request", auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE] },
      // { name: "Xác nhận lịch trực", path: "/category/confirm-staff-work-schedule", auth: [ADMIN, HR_MANAGER] },
      { name: "Phê duyệt chấm công", path: "/check-inout-result", auth: [ADMIN, HR_MANAGER] },
      { name: "Thống kê công", path: "/time-sheet-summary", auth: [ADMIN, HR_MANAGER, HR_TIMEKEEPING_MANAGER] },
    ],
  },
  {
    name: "Nghỉ phép",
    icon: "event",
    auth: ALL_ROLES,
    children: [
      { name: "Đơn xin nghỉ phép", path: "/my-leave", auth: ALL_ROLES },
      { name: "Phê duyệt nghỉ phép", path: "/leave-requests", auth: [ADMIN, HR_MANAGER] },
      { name: "Số dư phép năm", path: "/leave-balance", auth: [ADMIN, HR_MANAGER] },
    ],
  },
  // {
  //   name: "KPI",
  //   icon: "assessment",
  //   auth: [ADMIN, HR_MANAGER, HR_COMPENSATION_BENEFIT, HR_EMPLOYEE],
  //   children: [
  //     { name: "Thành phần KPI", path: "/hr-kpi/hr-kpi-item", auth: [ADMIN, HR_MANAGER] },
  //     { name: "Mẫu KPI", path: "/hr-kpi/hr-kpi-template", auth: [ADMIN, HR_MANAGER] },
  //     { name: "Kỳ đánh giá KPI", path: "/hr-kpi/hr-kpi-evaluation-period", auth: [ADMIN, HR_MANAGER] },
  //     { name: "Đăng ký chỉ tiêu KPI", path: "/hr-kpi/hr-kpi-target-register", auth: [ADMIN, HR_EMPLOYEE] },
  //     { name: "Kết quả KPI", path: "/hr-kpi/hr-kpi-result", auth: [ADMIN, HR_EMPLOYEE] },
  //   ]
  // },
  {
    name: "Lương thưởng",
    icon: "attach_money",
    auth: [ADMIN, HR_MANAGER, HR_COMPENSATION_BENEFIT, HR_EMPLOYEE],
    children: [
      { name: "Khoản lương", path: "/salary/salary-item", auth: [ADMIN, HR_MANAGER, HR_COMPENSATION_BENEFIT] },
      { name: "Kỳ lương", path: "/salary/salary-period", auth: [ADMIN, HR_MANAGER, HR_COMPENSATION_BENEFIT] },
      { name: "Tạm ứng lương", path: "/salary/staff-advance-payment", auth: [HR_EMPLOYEE, HR_COMPENSATION_BENEFIT] },
      { name: "Bảng lương", path: "/salary/payrolls", auth: [ADMIN, HR_COMPENSATION_BENEFIT] },
      { name: "Phiếu lương cá nhân", path: "/salary/salary-staff-payslip", auth: [HR_EMPLOYEE] },
    ],
  },
  // {
  //   name: "Bảo hiểm",
  //   icon: "security",
  //   auth: [ADMIN, HR_MANAGER, HR_COMPENSATION_BENEFIT],
  //   children: [
  //     { name: "BHXH nhân viên", path: "/insurance/staff-social-insurance", auth: [ADMIN, HR_MANAGER, HR_COMPENSATION_BENEFIT] },
  //     // { name: "Gói bảo hiểm", path: "/insurance-package", auth: [ADMIN, HR_MANAGER] },
  //   ],
  // },
  // {
  //   name: "Pháp chế",
  //   icon: "gavel",
  //   auth: [ADMIN, HR_MANAGER],
  //   children: [
  //     { name: "Sổ quản lý lao động", path: "/staff-labour-management-book", auth: [ADMIN, HR_MANAGER] },
  //   ]
  // },
  {
    name: "Công việc & Dự án",
    icon: "work",
    auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE],
    children: [
      { name: "Công việc", path: "/tasks", auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE] },
      { name: "Dự án", path: "/projects", auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE] },
      // { name: "Trạng thái thực hiện", path: "/category/working-status", auth: [ADMIN] },
    ],
  },
  // {
  //   name: "Quy trình (Flowable)",
  //   icon: "account_tree",
  //   auth: [ADMIN, HR_MANAGER],
  //   children: [
  //     { name: "Quy trình mẫu", path: "/profile-page/process-definitions" },
  //     { name: "Công việc quy trình", path: "/profile-page/flowable-my-work" },
  //     { name: "Danh mục quy trình", path: "/profile-page/process-categories" },
  //   ]
  // },
  // {
  //   name: "Quản lý văn bản",
  //   icon: "edit_document",
  //   auth: [ADMIN, HR_MANAGER],
  //   children: [
  //     { name: "Văn bản đi", path: "/document/outgoing-document" },
  //     { name: "Văn bản đến", path: "/document/incoming-document" },
  //     { name: "Sổ văn bản", path: "/document/document-book" },
  //     { name: "Loại văn bản", path: "/document/document-type" },
  //   ]
  // },
  // {
  //   name: "Ngân sách",
  //   icon: "wallet",
  //   auth: [ADMIN],
  //   children: [
  //     { name: "Quản lý ngân sách", path: "/budget/budget" },
  //     { name: "Danh mục ngân sách", path: "/budget/budget-category" },
  //     { name: "Chứng từ", path: "/budget/voucher" },
  //     { name: "Báo cáo ngân sách", path: "/budget/report" },
  //   ]
  // },
  // {
  //   name: "Báo cáo",
  //   icon: "assessment",
  //   auth: [ADMIN, HR_MANAGER, HR_RECRUITMENT],
  //   children: [
  //     { name: "BC Định biên nhân sự", path: "/report/hr-resource-plan-report", auth: [ADMIN, HR_MANAGER] },
  //     { name: "BC Yêu cầu tuyển dụng", path: "/report/recruitment-request-report", auth: [ADMIN, HR_RECRUITMENT] },
  //     { name: "BC Tiếp nhận ứng viên", path: "/export-candidate-report", auth: [ADMIN, HR_RECRUITMENT] },
  //     { name: "BC Sử dụng lao động", path: "/report/staff-labour-util-report", auth: [ADMIN] },
  //   ],
  // },
  {
    name: "Quản trị",
    icon: "settings",
    auth: [ADMIN],
    children: [
      { name: "Tài khoản", path: "/administration/accounts", auth: [ADMIN] },
      { name: "Vai trò", path: "/administration/roles", auth: [ADMIN] },
      // { name: "Đơn vị hành chính", path: "/category/administrative-unit", auth: [ADMIN] },
      // { name: "Cấu hình hệ thống", path: "/category/system-config", auth: [ADMIN] },
    ],
  },
  // { name: "Chat nội bộ", path: "https://realtimechat.duyhanh.site", icon: "chat", external: true, auth: ALL_ROLES },
];

export const getBreadcrumbByPath = (pathname) => {
  const segments = [{ name: "Trang chủ", path: "/dashboard" }];
  if (pathname === "/" || pathname === "/dashboard") return segments;

  const findPathInMenu = (items, currentPath) => {
    for (const item of items) {
      // Trường hợp khớp chính xác path
      if (item.path && item.path === currentPath) {
        return [{ name: item.name, path: item.path }];
      }
      
      // Trường hợp có con, tìm kiếm đệ quy
      if (item.children && item.children.length > 0) {
        const found = findPathInMenu(item.children, currentPath);
        if (found) {
          // Nếu tìm thấy trong con, trả về [Cha, ...Con]
          return [{ name: item.name, path: item.path || null }, ...found];
        }
      }
    }
    return null;
  };

  const result = findPathInMenu(navigations, pathname);
  if (result) {
    // Lọc bỏ các segment không có path (nếu muốn) hoặc giữ lại tên để hiển thị
    return [...segments, ...result];
  }

  return segments;
};

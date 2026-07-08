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
    path: "/home",
    icon: "home",
    auth: ALL_ROLES
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: "assessment",
    auth: [ADMIN]
  },
  {
    name: "Cơ cấu tổ chức",
    icon: "account_tree",
    auth: [ADMIN, HR_MANAGER],
    children: [
      { name: "Phòng ban", path: "/department", auth: [ADMIN] },
      { name: "Quản lý vị trí", path: "/category/staff/position", auth: [ADMIN] },
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
    auth: [ADMIN, HR_MANAGER],
    children: [
      { name: "Hồ sơ nhân viên", path: "/staff/all", auth: [ADMIN, HR_MANAGER] },
    ],
  },
  {
    name: "Chấm công",
    icon: "access_time",
    auth: [ADMIN, HR_MANAGER, HR_TIMEKEEPING_MANAGER, HR_EMPLOYEE],
    children: [
      { name: "Ngày lễ / Sự kiện", path: "/holidays", auth: [ADMIN, HR_MANAGER] },
      { name: "Chi tiết chấm công", path: "/time-sheet-detail", auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE] },
      { name: "Phê duyệt chấm công", path: "/check-inout-result", auth: [ADMIN, HR_MANAGER] },
      { name: "Thống kê công", path: "/time-sheet-summary", auth: [ADMIN, HR_MANAGER, HR_TIMEKEEPING_MANAGER] },
    ],
  },
  {
    name: "Nghỉ phép",
    icon: "event",
    auth: ALL_ROLES,
    children: [
      { name: "Yêu cầu nghỉ phép", path: "/my-leave", auth: ALL_ROLES },
      { name: "Phê duyệt nghỉ phép", path: "/leave-requests", auth: [ADMIN, HR_MANAGER] },
      { name: "Số dư phép năm", path: "/leave-balance", auth: [ADMIN, HR_MANAGER] },
    ],
  },
  {
    name: "Lương thưởng",
    icon: "attach_money",
    auth: [ADMIN, HR_MANAGER, HR_COMPENSATION_BENEFIT, HR_EMPLOYEE],
    children: [
      { name: "Khoản lương", path: "/salary/salary-item", auth: [ADMIN, HR_MANAGER, HR_COMPENSATION_BENEFIT] },
      { name: "Cấu hình lương nhân viên", path: "/salary/staff-salary-config", auth: [ADMIN, HR_MANAGER, HR_COMPENSATION_BENEFIT] },
      { name: "Kỳ lương", path: "/salary/salary-period", auth: [ADMIN, HR_MANAGER, HR_COMPENSATION_BENEFIT] },
      { name: "Bảng lương", path: "/salary/payrolls", auth: [ADMIN, HR_COMPENSATION_BENEFIT] },
      { name: "Phiếu lương cá nhân", path: "/salary/salary-staff-payslip", auth: [HR_EMPLOYEE] },
    ],
  },
  {
    name: "Công việc & Dự án",
    icon: "work",
    auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE],
    children: [
      { name: "Công việc", path: "/tasks", auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE] },
      { name: "Dự án", path: "/projects", auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE] },
    ],
  },
  {
    name: "Quản trị",
    icon: "settings",
    auth: [ADMIN],
    children: [
      { name: "Tài khoản", path: "/administration/accounts", auth: [ADMIN] },
      { name: "Vai trò", path: "/administration/roles", auth: [ADMIN] },
    ],
  },
];

export const getBreadcrumbByPath = (pathname) => {
  if (pathname === "/" || pathname === "/dashboard") {
    return [{ name: "Dashboard", path: "/dashboard" }];
  }

  const findPathInMenu = (items, currentPath) => {
    for (const item of items) {
      if (item.path && item.path === currentPath) {
        return [{ name: item.name, path: item.path }];
      }
      
      if (item.children && item.children.length > 0) {
        const found = findPathInMenu(item.children, currentPath);
        if (found) {
          return [{ name: item.name, path: item.path || null }, ...found];
        }
      }
    }
    return null;
  };

  const result = findPathInMenu(navigations, pathname);
  if (result) {
    return result;
  }

  return [];
};

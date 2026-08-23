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
  // CÁ NHÂN & TỔNG QUAN
  {
    section: "CÁ NHÂN & TỔNG QUAN",
    name: "Dashboard",
    path: "/dashboard",
    icon: "assessment",
    auth: [ADMIN]
  },
  {
    section: "CÁ NHÂN & TỔNG QUAN",
    name: "Trang chủ",
    path: "/home",
    icon: "home",
    auth: ALL_ROLES
  },
  {
    section: "CÁ NHÂN & TỔNG QUAN",
    name: "Thông báo",
    path: "/announcements",
    icon: "campaign",
    auth: ALL_ROLES
  },

  // TỔ CHỨC & NHÂN SỰ
  {
    section: "TỔ CHỨC & NHÂN SỰ",
    name: "Hồ sơ nhân viên",
    path: "/staff/all",
    icon: "people",
    auth: [ADMIN, HR_MANAGER]
  },
  {
    section: "TỔ CHỨC & NHÂN SỰ",
    name: "Tin tuyển dụng",
    path: "/recruitments",
    icon: "vertical_split",
    auth: [ADMIN, HR_MANAGER, HR_RECRUITMENT]
  },
  {
    section: "TỔ CHỨC & NHÂN SỰ",
    name: "Phòng ban",
    path: "/department",
    icon: "account_tree",
    auth: [ADMIN]
  },
  {
    section: "TỔ CHỨC & NHÂN SỰ",
    name: "Quản lý vị trí",
    path: "/category/staff/position",
    icon: "account_tree",
    auth: [ADMIN]
  },

  // CHẤM CÔNG & NGHỈ PHÉP
  {
    section: "CHẤM CÔNG & NGHỈ PHÉP",
    name: "Chi tiết chấm công",
    path: "/time-sheet-detail",
    icon: "access_time",
    auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE]
  },
  {
    section: "CHẤM CÔNG & NGHỈ PHÉP",
    name: "Phê duyệt chấm công",
    path: "/check-inout-result",
    icon: "access_time",
    auth: [ADMIN, HR_MANAGER]
  },
  {
    section: "CHẤM CÔNG & NGHỈ PHÉP",
    name: "Thống kê công",
    path: "/time-sheet-summary",
    icon: "assessment",
    auth: [ADMIN, HR_MANAGER, HR_TIMEKEEPING_MANAGER]
  },
  {
    section: "CHẤM CÔNG & NGHỈ PHÉP",
    name: "Yêu cầu nghỉ phép",
    path: "/my-leave",
    icon: "event",
    auth: ALL_ROLES
  },
  {
    section: "CHẤM CÔNG & NGHỈ PHÉP",
    name: "Phê duyệt nghỉ phép",
    path: "/leave-requests",
    icon: "event",
    auth: [ADMIN, HR_MANAGER]
  },
  {
    section: "CHẤM CÔNG & NGHỈ PHÉP",
    name: "Số dư phép năm",
    path: "/leave-balance",
    icon: "event",
    auth: [ADMIN, HR_MANAGER]
  },
  {
    section: "CHẤM CÔNG & NGHỈ PHÉP",
    name: "Ngày lễ / Sự kiện",
    path: "/holidays",
    icon: "event",
    auth: [ADMIN, HR_MANAGER]
  },

  // LƯƠNG THƯỞNG
  {
    section: "LƯƠNG THƯỞNG",
    name: "Phiếu lương cá nhân",
    path: "/salary/salary-staff-payslip",
    icon: "attach_money",
    auth: [HR_EMPLOYEE]
  },
  {
    section: "LƯƠNG THƯỞNG",
    name: "Bảng lương",
    path: "/salary/payrolls",
    icon: "attach_money",
    auth: [ADMIN, HR_COMPENSATION_BENEFIT]
  },
  {
    section: "LƯƠNG THƯỞNG",
    name: "Khoản lương",
    path: "/salary/salary-item",
    icon: "attach_money",
    auth: [ADMIN, HR_MANAGER, HR_COMPENSATION_BENEFIT]
  },
  {
    section: "LƯƠNG THƯỞNG",
    name: "Cấu hình lương nhân viên",
    path: "/salary/staff-salary-config",
    icon: "settings",
    auth: [ADMIN, HR_MANAGER, HR_COMPENSATION_BENEFIT]
  },
  {
    section: "LƯƠNG THƯỞNG",
    name: "Kỳ lương",
    path: "/salary/salary-period",
    icon: "event",
    auth: [ADMIN, HR_MANAGER, HR_COMPENSATION_BENEFIT]
  },

  // CÔNG VIỆC & DỰ ÁN
  {
    section: "CÔNG VIỆC & DỰ ÁN",
    name: "Công việc",
    path: "/tasks",
    icon: "work",
    auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE]
  },
  {
    section: "CÔNG VIỆC & DỰ ÁN",
    name: "Dự án",
    path: "/projects",
    icon: "work",
    auth: [ADMIN, HR_MANAGER, HR_EMPLOYEE]
  },

  // QUẢN TRỊ
  {
    section: "QUẢN TRỊ",
    name: "Quản lý thông báo",
    path: "/administration/announcements",
    icon: "campaign",
    auth: [ADMIN, HR_MANAGER]
  },
  {
    section: "QUẢN TRỊ",
    name: "Tài khoản",
    path: "/administration/accounts",
    icon: "person",
    auth: [ADMIN]
  },
  {
    section: "QUẢN TRỊ",
    name: "Vai trò",
    path: "/administration/roles",
    icon: "security",
    auth: [ADMIN]
  },
  {
    section: "QUẢN TRỊ",
    name: "Danh mục chung",
    icon: "list_alt",
    auth: [ADMIN, HR_MANAGER],
    children: [
      {
        name: "Ngân hàng",
        path: "/category/bank",
        icon: "wallet",
        auth: [ADMIN, HR_MANAGER]
      },
      {
        name: "Dân tộc",
        path: "/category/ethnic",
        icon: "bookmark",
        auth: [ADMIN, HR_MANAGER]
      },
      {
        name: "Đơn vị hành chính",
        path: "/category/administrative-unit",
        icon: "account_tree",
        auth: [ADMIN, HR_MANAGER]
      }
    ]
  }
];

export const getBreadcrumbByPath = (pathname) => {
  if (pathname === "/" || pathname === "/dashboard") {
    return [{ name: "Dashboard", path: "/dashboard" }];
  }

  for (const item of navigations) {
    // 1. Kiểm tra menu con (children) trước
    if (item.children && item.children.length > 0) {
      for (const child of item.children) {
        if (child.path && (child.path === pathname || (pathname.startsWith(child.path) && child.path !== "/"))) {
          const breadcrumbs = [];
          if (item.section) {
            breadcrumbs.push({ name: item.section, path: null });
          }
          if (item.name) {
            breadcrumbs.push({ name: item.name, path: null });
          }
          breadcrumbs.push({ name: child.name, path: child.path });
          return breadcrumbs;
        }
      }
    }

    // 2. Kiểm tra menu cấp 1
    if (item.path && (item.path === pathname || (pathname.startsWith(item.path) && item.path !== "/"))) {
      return [
        { name: item.section || "HỆ THỐNG", path: null },
        { name: item.name, path: item.path }
      ];
    }
  }

  return [];
};


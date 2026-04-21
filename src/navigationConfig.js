export const navigations = [
  { name: "Trang chủ", path: "/dashboard", icon: "home" },
  {
    name: "Nhân viên",
    icon: "people",
    children: [
      { name: "Danh sách nhân viên", path: "/employee/list" },
      { name: "Thêm nhân viên", path: "/employee/add" },
    ],
  },
  {
    name: "Chấm công",
    icon: "access_time",
    children: [
      { name: "Chấm công", path: "/timesheet" },
      { name: "Bảng phân ca", path: "/timesheet/shift" },
      { name: "Thống kê công", path: "/timesheet/statistics" },
      { name: "Bảng chấm công", path: "/timesheet/board" },
      { name: "Thiết bị chấm công", path: "/timesheet/device" },
      { name: "Yêu cầu xác nhận làm thêm giờ", path: "/timesheet/overtime" },
      { name: "Yêu cầu nghỉ phép", path: "/timesheet/leave" },
      { name: "Xác nhận kết quả làm việc", path: "/timesheet/result" },
    ],
  },
  {
    name: "Lương thưởng",
    icon: "attach_money",
    children: [
      { name: "Bảng lương", path: "/salary/list" },
      { name: "Thưởng", path: "/salary/bonus" },
    ],
  },
  {
    name: "Bảo hiểm",
    icon: "security",
    children: [
      { name: "Bảo hiểm xã hội", path: "/insurance/social" },
      { name: "Bảo hiểm y tế", path: "/insurance/health" },
    ],
  },
  {
    name: "Cá nhân",
    icon: "person",
    children: [
      { name: "Thông tin cá nhân", path: "/personal/info" },
    ],
  },
  {
    name: "Công việc",
    icon: "work",
    children: [
      { name: "Danh sách công việc", path: "/work/list" },
    ],
  },
  { name: "Chat nội bộ", path: "https://realtimechat.duyhanh.site", icon: "chat", external: true },
];

export const getBreadcrumbByPath = (pathname) => {
  const segments = [{ name: "Trang chủ", path: "/dashboard" }];
  if (pathname === "/" || pathname === "/dashboard") return segments;

  for (const nav of navigations) {
    if (!nav.children && nav.path === pathname) {
      segments.push({ name: nav.name, path: nav.path });
      return segments;
    }
    if (nav.children) {
      const sortedChildren = [...nav.children].sort((a, b) => b.path.length - a.path.length);
      const child = sortedChildren.find((c) => pathname.startsWith(c.path));
      if (child) {
        segments.push({ name: nav.name });
        segments.push({ name: child.name, path: child.path });
        return segments;
      }
    }
  }
  return segments;
};

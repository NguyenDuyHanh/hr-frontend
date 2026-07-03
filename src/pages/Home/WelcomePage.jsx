import React from "react";
import { useNavigate } from "react-router-dom";
import { Grid } from "@mui/material";
import useAuthStore from "@/store/useAuthStore";
import { navigations } from "@/navigationConfig";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import WorkIcon from "@mui/icons-material/Work";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import VerticalSplitIcon from "@mui/icons-material/VerticalSplit";
import EventIcon from "@mui/icons-material/Event";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WavingHandIcon from "@mui/icons-material/WavingHand";

const IconMap = {
  home: HomeIcon,
  people: PeopleIcon,
  access_time: AccessTimeIcon,
  attach_money: AttachMoneyIcon,
  work: WorkIcon,
  assessment: AssessmentIcon,
  settings: SettingsIcon,
  account_tree: AccountTreeIcon,
  vertical_split: VerticalSplitIcon,
  event: EventIcon,
};

const WelcomePage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const userRoles = user?.role || [];

  // Định dạng ngày hiện tại bằng Tiếng Việt
  const getFormattedDate = () => {
    const today = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return today.toLocaleDateString("vi-VN", options);
  };

  // Lọc danh sách menu được phép xem (bỏ qua trang Dashboard và Trang chủ)
  const allowedMenus = navigations
    .filter(
      (item) =>
        item.path !== "/dashboard" &&
        item.path !== "/home" &&
        (!item.auth || item.auth.some((r) => userRoles.includes(r)))
    )
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(
            (child) => !child.auth || child.auth.some((r) => userRoles.includes(r))
          ),
        };
      }
      return item;
    })
    .filter((item) => {
      // Chỉ giữ lại menu đơn lẻ hoặc menu cha có chứa các mục con được phân quyền
      if (item.children && item.children.length === 0) return false;
      return true;
    });

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in px-4 md:px-6 py-6 pb-12">
      {/* Banner Chào mừng Premium */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 md:p-6 shadow-sm">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary/5 blur-2xl"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center p-2 rounded-xl bg-primary/10 text-primary animate-bounce">
                <WavingHandIcon className="text-[24px]" />
              </span>
              <span className="text-sm font-semibold tracking-wide text-primary uppercase">
                Cổng thông tin HRM Hub
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Xin chào, {user?.staffName || user?.fullName || user?.username || "Thành viên"}!
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-[600px] leading-relaxed">
              Chào mừng bạn đến với hệ thống quản lý nhân sự hiện đại. Chúc bạn có một ngày làm việc hiệu quả và nhiều niềm vui!
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-1.5 py-2 px-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm self-start md:self-center">
            <span className="text-[12px] font-medium text-muted-foreground">
              Hôm nay là
            </span>
            <span className="text-[14px] md:text-[15px] font-semibold text-primary">
              {getFormattedDate()}
            </span>
          </div>
        </div>
      </div>

      {/* Grid các chức năng */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary rounded-full"></span>
          Chức năng dành cho bạn
        </h2>

        {allowedMenus.length === 0 ? (
          <div className="text-center p-12 rounded-xl border border-dashed border-border bg-card">
            <p className="text-muted-foreground">Bạn chưa được phân quyền truy cập chức năng nào trên hệ thống.</p>
            <p className="text-xs text-gray-400 mt-2">Vui lòng liên hệ Quản trị viên để biết thêm chi tiết.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {allowedMenus.map((menu, index) => {
              const IconComponent = IconMap[menu.icon] || HomeIcon;
              return (
                <div key={index} className="group h-full bg-card border border-border hover:border-primary/30 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                  <div className="space-y-5">
                    {/* Category Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                        <IconComponent className="text-[22px]" />
                      </div>
                      <h3 className="font-bold text-[17px] text-foreground group-hover:text-primary transition-colors">
                        {menu.name}
                      </h3>
                    </div>

                    {/* Sub Links (Children) */}
                    {menu.children && (
                      <div className="flex flex-col gap-3 mt-4">
                        {menu.children.map((child, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => navigate(child.path)}
                            className="w-full flex items-center justify-between text-left text-sm font-semibold text-foreground/80 hover:text-primary bg-background border border-border hover:border-primary/25 hover:bg-primary/5 py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group/btn"
                          >
                            <span>{child.name}</span>
                            <ArrowForwardIcon className="text-[14px] opacity-0 group-hover/btn:opacity-100 transition-opacity transform translate-x-[-4px] group-hover/btn:translate-x-0 duration-200 text-primary" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Widget Giới thiệu & Trợ giúp nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-border bg-card space-y-3">
          <h3 className="font-bold text-[15px] text-foreground">Bạn cần trợ giúp?</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Nếu bạn gặp khó khăn trong quá trình sử dụng hệ thống (chấm công lỗi, không tạo được đơn nghỉ phép, hoặc sai thông tin lương), hãy bấm vào Widget Trợ lý AI ở góc phải màn hình để được hỗ trợ giải đáp nhanh.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-card space-y-3">
          <h3 className="font-bold text-[15px] text-foreground">Quy định Chấm công & Nghỉ phép</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Nhân viên vui lòng hoàn thành chấm công hàng ngày. Đơn xin nghỉ phép cần được tạo và phê duyệt trước ngày nghỉ tối thiểu 24 giờ. Số ngày phép năm chưa sử dụng sẽ được cộng dồn theo quy định của công ty.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;

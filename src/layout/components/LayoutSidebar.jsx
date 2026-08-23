import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChatIcon from "@mui/icons-material/Chat";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SecurityIcon from "@mui/icons-material/Security";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import VerticalSplitIcon from "@mui/icons-material/VerticalSplit";
import GavelIcon from "@mui/icons-material/Gavel";
import WalletIcon from "@mui/icons-material/AccountBalanceWallet";
import EditNoteIcon from "@mui/icons-material/EditNote";
import TokenIcon from "@mui/icons-material/Token";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ListAltIcon from "@mui/icons-material/ListAlt";
import EventIcon from "@mui/icons-material/Event";
import CampaignIcon from "@mui/icons-material/Campaign";
import SearchIcon from "@mui/icons-material/Search";
import AppsIcon from "@mui/icons-material/Apps";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import ViewSidebarIcon from "@mui/icons-material/ViewSidebar";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";


import { navigations } from "@/navigationConfig";
import useAuthStore from "@/store/useAuthStore";
import useSidebarStore from "@/store/sidebarStore";
import useMenuFilterStore from "@/store/useMenuFilterStore";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";

const IconMapper = memo(({ iconName, ...props }) => {
  const icons = {
    home: HomeIcon,
    people: PeopleIcon,
    access_time: AccessTimeIcon,
    attach_money: AttachMoneyIcon,
    security: SecurityIcon,
    person: PersonIcon,
    work: WorkIcon,
    chat: ChatIcon,
    assessment: AssessmentIcon,
    settings: SettingsIcon,
    account_tree: AccountTreeIcon,
    vertical_split: VerticalSplitIcon,
    gavel: GavelIcon,
    wallet: WalletIcon,
    edit_document: EditNoteIcon,
    token: TokenIcon,
    bookmark: BookmarkIcon,
    list_alt: ListAltIcon,
    event: EventIcon,
    campaign: CampaignIcon,
  };
  const IconComponent = icons[iconName] || HomeIcon;
  return <IconComponent {...props} />;
});

const NavSubGroup = memo(({ item, isCollapsed, location, t, currentLang }) => {
  const isAnyChildActive = useMemo(() => {
    return item.children?.some((child) => child.path && location.pathname.startsWith(child.path));
  }, [item.children, location.pathname]);

  const [isOpen, setIsOpen] = useState(isAnyChildActive);

  useEffect(() => {
    if (isAnyChildActive) {
      setIsOpen(true);
    }
  }, [isAnyChildActive]);

  if (isCollapsed) {
    return (
      <li className="space-y-1.5 flex flex-col items-center my-1">
        {item.children?.map((child) => {
          const isActive = child.path && location.pathname.startsWith(child.path);
          return (
            <Tooltip
              key={child.path || child.name}
              title={`${t("menu." + item.name, item.name)} > ${t("menu." + child.name, child.name)}`}
              placement="right"
              arrow
              enterDelay={100}
            >
              <NavLink
                to={child.path}
                className={`w-9 h-9 rounded-lg border flex items-center justify-center no-underline transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                    : "bg-background/40 text-sidebar-foreground/85 border-sidebar-border hover:bg-sidebar-accent/50 hover:border-primary/40 hover:text-sidebar-accent-foreground"
                }`}
              >
                <IconMapper iconName={child.icon || item.icon} style={{ fontSize: "18px" }} />
              </NavLink>
            </Tooltip>
          );
        })}
      </li>
    );
  }

  return (
    <li className="select-none">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center px-3 py-2 mx-2 rounded-lg text-[14px] no-underline transition-all duration-150 cursor-pointer border-none ${
          isAnyChildActive
            ? "bg-sidebar-accent/60 text-primary font-bold shadow-xs"
            : "bg-transparent text-sidebar-foreground/85 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        }`}
        style={{ width: "calc(100% - 16px)" }}
      >
        <IconMapper iconName={item.icon || "list_alt"} className="mr-3" style={{ fontSize: "19px" }} />
        <span className="flex-1 text-left truncate font-medium">
          {t("menu." + item.name, item.name)}
        </span>
        {isOpen ? <ExpandLessIcon sx={{ fontSize: "18px" }} /> : <ExpandMoreIcon sx={{ fontSize: "18px" }} />}
      </button>

      {isOpen && (
        <div className="ml-6 pl-2.5 border-l border-primary/60 my-1 space-y-1 mr-2">
          {item.children?.map((child) => {
            const isActive = child.path && location.pathname.startsWith(child.path);
            return (
              <NavLink
                key={child.path || child.name}
                to={child.path}
                className={`flex items-center px-3 py-2 rounded-lg text-[13.5px] no-underline transition-all duration-150 ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground active:scale-[0.98]"
                }`}
              >
                <span className="flex-1 truncate font-medium">
                  {t("menu." + child.name, child.name)}
                </span>
              </NavLink>
            );
          })}
        </div>
      )}
    </li>
  );
});

const LayoutSidebar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isCollapsed, isMobileOpen, toggleCollapsed, setMobileOpen } = useSidebarStore();
  const { selectedSections, resetFilter } = useMenuFilterStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // 1. Lọc menu theo quyền người dùng
  const roleFilteredNavigations = useMemo(() => {
    const userRoles = user?.role || [];
    return navigations
      .filter((item) => !item.auth || item.auth.some((r) => userRoles.includes(r)))
      .map((item) => {
        if (item.children) {
          const filteredChildren = item.children.filter(
            (c) => !c.auth || c.auth.some((r) => userRoles.includes(r))
          );
          return { ...item, children: filteredChildren };
        }
        return item;
      });
  }, [user?.role]);

  // 2. Lọc menu theo phân hệ đã chọn từ App Switcher Popover (nếu có)
  const sectionFilteredNavigations = useMemo(() => {
    if (!selectedSections || selectedSections.length === 0) return roleFilteredNavigations;
    return roleFilteredNavigations.filter((item) => selectedSections.includes(item.section));
  }, [roleFilteredNavigations, selectedSections]);

  // 3. Lọc menu theo từ khóa tìm kiếm
  const searchedNavigations = useMemo(() => {
    if (!searchQuery.trim()) return sectionFilteredNavigations;
    const q = searchQuery.toLowerCase().trim();
    return sectionFilteredNavigations.filter((item) => {
      const nameMatch = t('menu.' + item.name, item.name).toLowerCase().includes(q);
      const sectionMatch = item.section?.toLowerCase().includes(q);
      const childMatch = item.children?.some((c) =>
        t('menu.' + c.name, c.name).toLowerCase().includes(q)
      );
      return nameMatch || sectionMatch || childMatch;
    });
  }, [sectionFilteredNavigations, searchQuery, t]);

  // Nhóm menu theo Section Header
  const groupedNavigations = useMemo(() => {
    const groups = {};
    searchedNavigations.forEach((item) => {
      const sec = item.section || "KHÁC";
      if (!groups[sec]) groups[sec] = [];
      groups[sec].push(item);
    });
    return groups;
  }, [searchedNavigations]);

  // Đóng mobile menu khi chuyển route
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  const handleLogout = useCallback(() => {
    setShowLogoutConfirm(false);
    logout();
  }, [logout]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 top-0 z-[55] bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Wrapper */}
      <div
        className={`md:bg-sidebar flex-shrink-0
          ${isCollapsed ? "md:w-[60px] md:min-w-[60px]" : "md:w-[240px] md:min-w-[240px]"}
          w-0`}
      >
        <aside
          className={`fixed md:sticky top-0 z-[60] md:z-40 bg-sidebar select-none
            h-screen
            ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            ${isCollapsed ? "md:w-[60px] md:min-w-[60px]" : "md:w-[240px] md:min-w-[240px]"}
            w-[260px] min-w-[260px] md:w-full md:min-w-full`}
        >


          <div className="h-full text-sidebar-foreground border-r border-sidebar-border flex flex-col justify-between overflow-hidden">
            
            {/* Top Logo Header Area inside Sidebar - Always Centered */}
            <div className="h-[48px] px-3 flex items-center justify-center relative border-b border-sidebar-border bg-sidebar">
              <NavLink
                to="/"
                className="flex items-center justify-center no-underline hover:opacity-90"
              >
                {isCollapsed ? (
                  <img src="/assets/logo/logo-icon.svg" alt="HRM Logo" className="h-7 max-w-[50px] object-contain" />
                ) : (
                  <img src="/assets/logo/logo.svg" alt="HRM Logo" className="h-10 max-w-[170px] object-contain" />
                )}


              </NavLink>


              {/* Close Button on Mobile */}
              <IconButton
                size="small"
                onClick={() => setMobileOpen(false)}
                className="md:hidden text-sidebar-foreground absolute right-2"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>


            {/* Header / Search Area */}
            <div>
              {/* Search Bar in Expanded Mode */}
              {!isCollapsed && (
                <div className="p-2.5 border-b border-sidebar-border/60 bg-sidebar/50 flex items-center gap-2">
                  <div className="relative flex-1 flex items-center">
                    <SearchIcon
                      className="absolute left-2.5 text-sidebar-foreground/50 pointer-events-none"
                      sx={{ fontSize: "19px" }}
                    />
                    <input
                      type="text"
                      placeholder={t("menu.search_placeholder", "Tìm menu...")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-7 py-1.5 text-[14px] bg-background border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 text-sidebar-foreground/50 hover:text-sidebar-foreground text-xs border-none bg-transparent cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Search Button in Collapsed Mode */}
              {/* {isCollapsed && (
                <div className="border-b border-sidebar-border/60 flex justify-center">
                  <Tooltip title={t("menu.search_placeholder", "Tìm menu...")} placement="right" arrow>
                    <button
                      onClick={toggleCollapsed}
                      className="p-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <SearchIcon sx={{ fontSize: "20px" }} />
                    </button>
                  </Tooltip>
                </div>
              )} */}
            </div>


            {/* Menu Body - Scrollable Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-2">
              {Object.keys(groupedNavigations).length === 0 ? (
                <div className="p-4 text-center text-sm text-sidebar-foreground/50">
                  {t("menu.no_result", "Không tìm thấy menu")}
                </div>
              ) : (
                Object.entries(groupedNavigations).map(([sectionName, items], sectionIndex) => (
                  <div key={sectionName} className="mb-2">
                    {/* Section Divider Line in Collapsed Mode */}
                    {isCollapsed && sectionIndex > 0 && (
                      <div className="w-6 h-[1px] bg-sidebar-foreground/20 my-4 mx-auto" />
                    )}

                    {/* Section Header Label (Only in Expanded mode) */}
                    {!isCollapsed && (
                      <div className="px-3 py-1.5 text-[12px] font-bold tracking-wider text-sidebar-foreground/60 uppercase select-none">
                        {t("menu." + sectionName, sectionName)}
                      </div>
                    )}

                    {/* Section Items (Flat List / Sub-groups) */}
                    <ul className={`list-none p-0 m-0 ${isCollapsed ? "space-y-1.5 px-2" : "space-y-0.5"}`}>
                      {items.map((item) => {
                        if (item.children && item.children.length > 0) {
                          return (
                            <NavSubGroup
                              key={item.name}
                              item={item}
                              isCollapsed={isCollapsed}
                              location={location}
                              t={t}
                              currentLang={i18n.language}
                            />
                          );
                        }

                        const isActive = item.path && location.pathname.startsWith(item.path);

                        if (isCollapsed) {
                          return (
                            <li key={item.path || item.name} className="flex justify-center">
                              <Tooltip
                                title={t("menu." + item.name, item.name)}
                                placement="right"
                                arrow
                                enterDelay={100}
                              >
                                <NavLink
                                  to={item.path}
                                  className={`w-9 h-9 rounded-lg border flex items-center justify-center no-underline transition-colors ${
                                    isActive
                                      ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                                      : "bg-background/40 text-sidebar-foreground/85 border-sidebar-border hover:bg-sidebar-accent/50 hover:border-primary/40 hover:text-sidebar-accent-foreground"
                                  }`}
                                >
                                  <IconMapper iconName={item.icon} style={{ fontSize: "19px" }} />
                                </NavLink>
                              </Tooltip>
                            </li>
                          );
                        }

                        return (
                          <li key={item.path || item.name}>
                            <NavLink
                              to={item.path}
                              className={`flex items-center px-3 py-2 mx-2 rounded-lg text-[14px] no-underline ${
                                isActive
                                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                                  : "text-sidebar-foreground/85 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                              }`}
                            >
                              <IconMapper
                                iconName={item.icon}
                                className="mr-3"
                                style={{ fontSize: "19px" }}
                              />
                              <span className="flex-1 truncate font-medium">
                                {t("menu." + item.name, item.name)}
                              </span>
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}

            </div>

            {/* Footer Area: Logout & Quick Action */}
            <div className="p-2 border-t border-sidebar-border bg-sidebar/30">
              {isCollapsed ? (
                <Tooltip title={t("header.logout", "Đăng xuất")} placement="right" arrow>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full flex items-center justify-center py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogoutIcon sx={{ fontSize: "20px" }} />
                  </button>
                </Tooltip>
              ) : (
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center px-3 py-2 text-[14px] font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                >
                  <LogoutIcon sx={{ fontSize: "19px" }} className="mr-3" />
                  <span>{t("header.logout", "Đăng xuất")}</span>
                </button>
              )}
            </div>



          </div>
        </aside>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        open={showLogoutConfirm}
        onConfirmDialogClose={() => setShowLogoutConfirm(false)}
        title={t("header.logout_confirm_title", "Xác nhận đăng xuất")}
        text={t("header.logout_confirm_text", "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?")}
        agree={t("header.logout", "Đăng xuất")}
        cancel={t("common.cancel", "Hủy")}
        onYesClick={handleLogout}
        container={document.getElementById("root")}
      />
    </>
  );
};

export default LayoutSidebar;

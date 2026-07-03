import React, { useState, useEffect, useCallback, memo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChatIcon from "@mui/icons-material/Chat";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SecurityIcon from "@mui/icons-material/Security";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";
import { navigations } from "@/navigationConfig";
import useAuthStore from "@/store/useAuthStore";
import useSidebarStore from "@/store/sidebarStore";

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
  };
  const IconComponent = icons[iconName];
  return IconComponent ? <IconComponent {...props} /> : null;
});

const SubSidebarItem = memo(({ child }) => {
  const location = useLocation();
  const hasActiveSubChild = child.children?.some(c => 
    c.path && location.pathname.startsWith(c.path)
  );
  
  const [isOpen, setIsOpen] = useState(() => hasActiveSubChild);

  useEffect(() => {
    if (hasActiveSubChild) {
      setIsOpen(true);
    }
  }, [hasActiveSubChild]);

  return (
    <li>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between pl-10 pr-3 py-[8px] cursor-pointer text-[14px] border-b border-sidebar-border ${
          hasActiveSubChild 
            ? "bg-sidebar-accent/60 text-sidebar-accent-foreground" 
            : "bg-sidebar text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground"
        }`}
      >
        <span>{child.name}</span>
        <ExpandMoreIcon 
          sx={{ 
            fontSize: "18px", 
            color: "currentColor", 
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
          }} 
        />
      </div>
      {isOpen && (
        <ul className="list-none p-0 m-0 bg-sidebar">
          {child.children.map((subChild, sIdx) => (
            <li key={sIdx}>
              <NavLink
                to={subChild.path}
                className={({ isActive }) =>
                  `flex items-center pl-16 pr-3 py-[8px] cursor-pointer text-[14px] border-b border-sidebar-border/50 no-underline 
                  ${isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "bg-sidebar text-sidebar-foreground/80 hover:bg-sidebar-accent/30 hover:text-sidebar-accent-foreground"}`
                }
              >
                {subChild.name}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
});

const SidebarItem = memo(({ item, expanded, onToggle, isCollapsed, onExpandSidebar }) => {
  const location = useLocation();
  const isExpanded = expanded === item.name;
  
  // Kiểm tra xem có con nào đang active không
  const hasActiveChild = item.children?.some(child => {
    if (child.children && child.children.length > 0) {
      return child.children.some(c => c.path && location.pathname.startsWith(c.path));
    }
    return child.path && location.pathname.startsWith(child.path);
  });

  if (isCollapsed) {
    const itemContent = item.children && item.children.length > 0 ? (
      <div
        onClick={onExpandSidebar}
        className={`flex items-center justify-center py-[12px] cursor-pointer border-b border-sidebar-border ${
          hasActiveChild 
            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground"
        }`}
      >
        <IconMapper iconName={item.icon} style={{ fontSize: "20px" }} />
      </div>
    ) : item.external ? (
      <a
        href={item.path}
        target="_blank"
        rel="noopener noreferrer"
        className="no-underline block w-full"
      >
        <div
          className="flex items-center justify-center py-[12px] cursor-pointer border-b border-sidebar-border text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground"
        >
          <IconMapper iconName={item.icon} style={{ fontSize: "20px" }} />
        </div>
      </a>
    ) : (
      <NavLink
        to={item.path}
        className="no-underline block w-full"
      >
        {({ isActive }) => (
          <div
            className={`flex items-center justify-center py-[12px] cursor-pointer border-b border-sidebar-border ${
              isActive 
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground"
            }`}
          >
            <IconMapper iconName={item.icon} style={{ fontSize: "20px" }} />
          </div>
        )}
      </NavLink>
    );

    return (
      <Tooltip title={item.name} placement="right" arrow enterDelay={100} leaveDelay={100}>
        {itemContent}
      </Tooltip>
    );
  }

  return (
    <div className="w-full">
      {item.children && item.children.length > 0 ? (
        <Accordion
          expanded={isExpanded}
          onChange={(e, isOpened) => onToggle(item.name, isOpened)}
          disableGutters
          square
          className="bg-background text-sidebar-foreground border-none shadow-none before:hidden"
          sx={{
            transition: "none !important",
            "&.MuiAccordion-root": {
              transition: "none !important",
            },
            "& .MuiAccordionSummary-root": {
              minHeight: "unset",
              px: "12px",
              py: "10px",
              borderBottom: "1px solid hsl(var(--sidebar-border))",
              backgroundColor: hasActiveChild ? "hsl(var(--sidebar-accent))" : "transparent",
              color: hasActiveChild ? "hsl(var(--sidebar-accent-foreground))" : "hsl(var(--sidebar-foreground))",
              transition: "none !important",
              "&:hover": {
                backgroundColor: hasActiveChild ? "hsl(var(--sidebar-accent))" : "hsl(var(--sidebar-accent) / 0.4)",
                color: "hsl(var(--sidebar-accent-foreground))",
              },
            },
            "& .MuiAccordionSummary-content": { margin: 0, display: "flex", alignItems: "center" },
            "& .MuiAccordionSummary-expandIconWrapper": { color: "hsl(var(--sidebar-foreground) / 0.7)" },
            "& .MuiAccordionDetails-root": { padding: 0, backgroundColor: "transparent" },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: "18px", color: "currentColor" }} />}>
            <IconMapper iconName={item.icon} className="mr-3" style={{ fontSize: "18px" }} />
            <span className="flex-1 font-normal text-[14px]">{item.name}</span>
          </AccordionSummary>
          <AccordionDetails>
            <ul className="list-none p-0 m-0">
              {item.children.map((child, idx) => (
                child.children && child.children.length > 0 ? (
                  <SubSidebarItem key={idx} child={child} />
                ) : (
                  <li key={idx}>
                    <NavLink
                      to={child.path}
                      className={({ isActive }) =>
                        `flex items-center pl-10 pr-3 py-[8px] cursor-pointer text-[14px] border-b border-sidebar-border no-underline 
                        ${isActive 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                          : "bg-sidebar text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground"}`
                      }
                    >
                      {child.name}
                    </NavLink>
                  </li>
                )
              ))}
            </ul>
          </AccordionDetails>
        </Accordion>
      ) : (
        <div className="">
          {item.external ? (
            <a
              href={item.path}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-[10px] cursor-pointer border-b border-sidebar-border no-underline bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground"
            >
              <IconMapper iconName={item.icon} className="mr-3" style={{ fontSize: "18px" }} />
              <span className="flex-1 font-normal text-[14px]">{item.name}</span>
            </a>
          ) : (
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-[10px] cursor-pointer border-b border-sidebar-border no-underline
                ${isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                  : "bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground"}`
              }
            >
              <IconMapper iconName={item.icon} className="mr-3" style={{ fontSize: "18px" }} />
              <span className="flex-1 font-normal text-[14px]">{item.name}</span>
            </NavLink>
          )}
        </div>
      )}
    </div>
  );
});

const LayoutSidebar = () => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { isCollapsed, isMobileOpen, setCollapsed, setMobileOpen } = useSidebarStore();

  // Lọc menu theo quyền (Sử dụng useMemo và tránh mutate mảng gốc)
  const filteredNavigations = React.useMemo(() => {
    const userRoles = user?.role || [];
    return navigations
      .filter((item) => !item.auth || item.auth.some((r) => userRoles.includes(r)))
      .map((item) => {
        // Nếu có con, tạo bản sao và lọc các con của bản sao đó
        if (item.children) {
          return {
            ...item,
            children: item.children.filter((child) => !child.auth || child.auth.some((r) => userRoles.includes(r))),
          };
        }
        return item;
      })
      // Chỉ giữ lại các menu cha có con (nếu ban đầu có con) hoặc menu đơn lẻ
      .filter((item) => {
        const originalItem = navigations.find(n => n.name === item.name);
        if (originalItem?.children && item.children?.length === 0) return false;
        return true;
      });
  }, [user?.role]);

  // Sử dụng useRef để theo dõi pathname trước đó
  const lastPathname = React.useRef(location.pathname);

  useEffect(() => {
    // Tự động đóng mobile menu khi chuyển trang
    setMobileOpen(false);

    // Chỉ tự động mở rộng khi đường dẫn thực sự thay đổi (chuyển trang)
    if (lastPathname.current !== location.pathname) {
      const activeItem = filteredNavigations.find(item => 
        item.children && item.children.some(child => location.pathname.startsWith(child.path))
      );
      if (activeItem) {
        setExpanded(activeItem.name);
      }
      lastPathname.current = location.pathname;
    }
  }, [location.pathname, filteredNavigations, setMobileOpen]);

  const handleToggle = useCallback((panel, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  }, []);

  const handleItemClick = useCallback((itemName) => {
    setCollapsed(false);
    setExpanded(itemName);
  }, [setCollapsed]);

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 top-0 z-[55] bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`md:bg-sidebar transition-[width,min-width] duration-300 flex-shrink-0
          ${isCollapsed ? "md:w-[50px] md:min-w-[50px]" : "md:w-[220px] md:min-w-[220px]"}
          w-0`}
      >
        <aside
          className={`fixed md:sticky top-0 md:top-[48px] z-[60] md:z-40 bg-sidebar select-none transition-[width,min-width,transform] duration-300
            h-screen md:h-[calc(100vh-48px-40px)]
            ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            ${isCollapsed ? "md:w-[50px] md:min-w-[50px]" : "md:w-[220px] md:min-w-[220px]"}
            w-[240px] min-w-[240px] md:w-full md:min-w-full`}
        >
          <div className="h-full text-sidebar-foreground border-r border-sidebar-border flex flex-col">
            {/* Mobile Header Logo inside Sidebar */}
            <div className="h-[48px] flex items-center justify-between px-4 bg-background border-b border-sidebar-border md:hidden">
              <NavLink to="/" className='bg-gradient-primary text-primary-foreground px-4 py-1 rounded-md font-bold text-[18px] tracking-widest no-underline'>
                H R M
              </NavLink>

              <IconButton color="inherit" size="small" onClick={() => setMobileOpen(false)}>
                <CloseIcon fontSize="small" sx={{ color: 'hsl(var(--foreground))' }} />
              </IconButton>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              <nav className="flex flex-col">
                {filteredNavigations.map((item, index) => (
                  <SidebarItem
                    key={index}
                    item={item}
                    expanded={expanded}
                    onToggle={handleToggle}
                    isCollapsed={isMobileOpen ? false : isCollapsed}
                    onExpandSidebar={() => handleItemClick(item.name)}
                  />
                ))}
              </nav>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default LayoutSidebar;

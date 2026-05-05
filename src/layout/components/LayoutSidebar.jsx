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
import { navigations } from "@/navigationConfig";
import useAuthStore from "@/store/useAuthStore";

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
  };
  const IconComponent = icons[iconName];
  return IconComponent ? <IconComponent {...props} /> : null;
});

const SidebarItem = memo(({ item, expanded, onToggle }) => {
  const location = useLocation();
  const isExpanded = expanded === item.name;
  
  // Kiểm tra xem có con nào đang active không
  const hasActiveChild = item.children?.some(child => 
    location.pathname.startsWith(child.path)
  );

  return (
    <div className="w-full">
      {item.children && item.children.length > 0 ? (
        <Accordion
          expanded={isExpanded}
          onChange={(e, isOpened) => onToggle(item.name, isOpened)}
          disableGutters
          square
          className="bg-transparent text-white border-none shadow-none before:hidden"
          sx={{
            "& .MuiAccordionSummary-root": {
              minHeight: "unset",
              px: "12px",
              py: "10px",
              borderBottom: "1px solid #4a83b6",
              backgroundColor: hasActiveChild ? "#c94a38" : "transparent",
              color: "#fff",
              "&:hover": {
                backgroundColor: hasActiveChild ? "#c94a38" : "#397fae",
              },
            },
            "& .MuiAccordionSummary-content": { margin: 0, display: "flex", alignItems: "center" },
            "& .MuiAccordionSummary-expandIconWrapper": { color: "#d6e7f2" },
            "& .MuiAccordionDetails-root": { padding: 0, backgroundColor: "#4276a4" },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: "18px", color: "white" }} />}>
            <IconMapper iconName={item.icon} className="mr-3" style={{ fontSize: "18px" }} />
            <span className="flex-1 font-normal text-[14px]">{item.name}</span>
          </AccordionSummary>
          <AccordionDetails>
            <ul className="list-none p-0 m-0">
              {item.children.map((child, idx) => (
                <li key={idx}>
                  <NavLink
                    to={child.path}
                    className={({ isActive }) =>
                      `flex items-center pl-10 pr-3 py-[8px] cursor-pointer text-[14px] border-b border-[#4a83b6] no-underline text-white 
                      ${isActive ? "bg-primary-light" : "bg-primary hover:bg-primary-light"}`
                    }
                  >
                    {child.name}
                  </NavLink>
                </li>
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
              className="flex items-center px-3 py-[10px] cursor-pointer border-b border-[#4a83b6] no-underline text-[#fff] hover:bg-[#4a83b6]"
            >
              <IconMapper iconName={item.icon} className="mr-3" style={{ fontSize: "18px" }} />
              <span className="flex-1 font-normal text-[14px]">{item.name}</span>
            </a>
          ) : (
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-[10px] cursor-pointer border-b border-[#4a83b6] no-underline text-[#fff]
                ${isActive ? "bg-[#c94a38]" : ""} hover:bg-[#4a83b6]`
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
  // Lọc menu theo quyền (Sử dụng useMemo và tránh mutate mảng gốc)
  const filteredNavigations = React.useMemo(() => {
    return navigations
      .filter((item) => !item.auth || item.auth.includes(user?.role))
      .map((item) => {
        // Nếu có con, tạo bản sao và lọc các con của bản sao đó
        if (item.children) {
          return {
            ...item,
            children: item.children.filter((child) => !child.auth || child.auth.includes(user?.role)),
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
  }, [location.pathname, filteredNavigations]);

  const handleToggle = useCallback((panel, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  }, []);

  return (
    <aside className="w-[220px] min-w-[220px] bg-primary select-none">
      <div className="sticky top-[48px] h-[calc(100vh-48px-40px)] text-white flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <nav className="flex flex-col">
            {filteredNavigations.map((item, index) => (
              <SidebarItem key={index} item={item} expanded={expanded} onToggle={handleToggle} />
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default LayoutSidebar;

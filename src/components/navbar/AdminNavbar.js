import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Zap,
  Search,
  LogOut,
  PlusCircle,
  BookOpen,
  Settings,
  User,
  ChevronLeft,
} from "lucide-react";
import LogoExpanded from "../../assets/LogoLong.svg";
import LogoUnexpanded from "../../assets/Logo.svg";
import {
  NavContainer,
  LogoContainer,
  Logo,
  NavItems,
  NavItem,
  LogoutButton,
  ToggleButton,
} from "./NavbarStyles";
import { useLogout } from "./navbarUtils";
import { useRecoilState } from "recoil";
import { isNavExpandedState } from "../../recoil/atoms";
import styled from "styled-components";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useLogout();
  const [isExpanded, setIsExpanded] = useRecoilState(isNavExpandedState);

  const isActive = (path) => {
    if (path === "/sermon-list") {
      return location.pathname.includes("/main/sermon-list");
    }
    if (path === "/admin") {
      // 관리 페이지, 사용자 관리, 설교 관리 페이지에서 모두 활성화
      return (
        location.pathname.includes("/main/admin") ||
        location.pathname.includes("/main/user-management") ||
        location.pathname.includes("/main/sermon-management")
      );
    }
    return (
      location.pathname === `/main${path}` ||
      (path === "/quick-reading" && location.pathname === "/main")
    );
  };

  return (
    <NavContainer isExpanded={isExpanded}>
      <ToggleButton
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronLeft />
      </ToggleButton>
      <LogoContainer>
        <Logo
          src={isExpanded ? LogoExpanded : LogoUnexpanded}
          alt="Bibly Logo"
          onClick={() => navigate("/main")}
          isExpanded={isExpanded}
        />
      </LogoContainer>
      <NavItems>
        <NavItem
          onClick={() => navigate("/main/quick-reading")}
          active={isActive("/quick-reading")}
          isExpanded={isExpanded}
        >
          <Zap size={24} />
          <span>빠른 성경 읽기</span>
        </NavItem>
        <NavItem
          onClick={() => navigate("/main/search")}
          active={isActive("/search")}
          isExpanded={isExpanded}
        >
          <Search size={24} />
          <span>검색</span>
        </NavItem>
        <NavItem
          onClick={() => navigate("/main/add-sermon")}
          active={isActive("/add-sermon")}
          isExpanded={isExpanded}
        >
          <PlusCircle size={24} />
          <span>설교 작성</span>
        </NavItem>
        <NavItem
          onClick={() => navigate("/main/sermon-list")}
          active={isActive("/sermon-list")}
          isExpanded={isExpanded}
        >
          <BookOpen size={24} />
          <span>설교 목록</span>
        </NavItem>
        <NavItem
          onClick={() => navigate("/main/mypage")}
          active={isActive("/mypage")}
          isExpanded={isExpanded}
        >
          <User size={24} />
          <span>마이페이지</span>
        </NavItem>
        <AdminNavItem
          onClick={() => navigate("/main/admin")}
          active={isActive("/admin")}
          isExpanded={isExpanded}
        >
          <Settings size={24} />
          <span>관리 페이지</span>
        </AdminNavItem>
      </NavItems>
      <LogoutButton onClick={logout} isExpanded={isExpanded}>
        <LogOut size={24} />
        <span>로그아웃</span>
      </LogoutButton>
    </NavContainer>
  );
};

const AdminNavItem = styled(NavItem)`
  margin-top: 20px;
  padding: 14px ${(props) => (props.isExpanded ? "20px" : "0")};
  background: ${(props) =>
    props.active ? "#ff4444" : "rgba(255, 68, 68, 0.08)"};
  border-left: 4px solid #ff6666;
  position: relative;

  &:hover {
    background: rgba(255, 68, 68, 0.2);
    transform: translateX(5px);

    svg,
    span {
      color: #ff4444;
    }
  }

  svg {
    color: ${(props) => (props.active ? "#ffffff" : "#ff4444")};
  }

  span {
    color: ${(props) => (props.active ? "#ffffff" : "#ff4444")};
    font-weight: 600;
  }

  &::after {
    content: "관리자";
    position: absolute;
    right: ${(props) => (props.isExpanded ? "16px" : "none")};
    top: 50%;
    transform: translateY(-50%);
    font-size: 11px;
    padding: 2px 6px;
    background: #ff4444;
    color: white;
    border-radius: 10px;
    display: ${(props) => (props.isExpanded ? "block" : "none")};
  }
`;

export default AdminNavbar;

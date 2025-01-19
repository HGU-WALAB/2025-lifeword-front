import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Zap, Search, Bookmark, LogOut, PlusCircle, BookOpen, Settings } from 'lucide-react';
import LogoWhite from '../../assets/LogoWhite.png';
import { NavContainer, LogoContainer, Logo, NavItems, NavItem, LogoutButton } from './NavbarStyles';
import { handleLogout } from './navbarUtils';

const AdminNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/sermon-list') {
            return location.pathname.includes('/main/sermon-list');
        }
        if (path === '/admin') {
            // 관리 페이지, 사용자 관리, 설교 관리 페이지에서 모두 활성화
            return (
                location.pathname.includes('/main/admin') ||
                location.pathname.includes('/main/user-management') ||
                location.pathname.includes('/main/sermon-management')
            );
        }
        return location.pathname === `/main${path}` || (path === '/quick-reading' && location.pathname === '/main');
    };

    return (
        <NavContainer>
            <LogoContainer>
                <Logo src={LogoWhite} alt="Bibly Logo" onClick={() => navigate('/main')} />
            </LogoContainer>
            <NavItems>
                <NavItem onClick={() => navigate('/main/quick-reading')} active={isActive('/quick-reading')}>
                    <Zap size={24} />
                    <span>빠른 성경 읽기</span>
                </NavItem>
                <NavItem onClick={() => navigate('/main/search')} active={isActive('/search')}>
                    <Search size={24} />
                    <span>검색</span>
                </NavItem>
                <NavItem onClick={() => navigate('/main/bookmarks')} active={isActive('/bookmarks')}>
                    <Bookmark size={24} />
                    <span>북마크</span>
                </NavItem>
                <NavItem onClick={() => navigate('/main/add-sermon')} active={isActive('/add-sermon')}>
                    <PlusCircle size={24} />
                    <span>설교 작성</span>
                </NavItem>
                <NavItem onClick={() => navigate('/main/sermon-list')} active={isActive('/sermon-list')}>
                    <BookOpen size={24} />
                    <span>설교 목록</span>
                </NavItem>
                <NavItem onClick={() => navigate('/main/admin')} active={isActive('/admin')}>
                    <Settings size={24} />
                    <span>관리 페이지</span>
                </NavItem>
            </NavItems>
            <LogoutButton onClick={() => handleLogout(navigate)}>
                <LogOut size={24} />
                <span>로그아웃</span>
            </LogoutButton>
        </NavContainer>
    );
};

export default AdminNavbar;

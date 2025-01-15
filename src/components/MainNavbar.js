import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Zap, Search, Bookmark, LogOut, PlusCircle, BookOpen } from 'lucide-react';
import LogoWhite from '../assets/LogoWhite.png';

const MainNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === `/main${path}` || (path === '/quick-reading' && location.pathname === '/main');
    };

    const handleLogout = () => {
        localStorage.removeItem('UID');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');

        window.location.href = '/eax9952';
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
            </NavItems>
            <LogoutButton onClick={handleLogout}>
                <LogOut size={24} />
                <span>로그아웃</span>
            </LogoutButton>
        </NavContainer>
    );
};

const NavContainer = styled.nav`
    width: 280px;
    height: 100vh;
    background-color: #1a1a1a;
    padding: 20px;
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
`;

const LogoContainer = styled.div`
    padding: 20px 0;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Logo = styled.img`
    width: 170px;
    height: auto;
`;

const NavItems = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 20px;
`;

const NavItem = styled.button`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    width: 100%;
    color: ${(props) => (props.active ? '#ffffff' : '#9ca3af')};
    border: none;
    background: ${(props) => (props.active ? '#2d2d2d' : 'none')};
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: #2d2d2d;
        color: #ffffff;
    }
`;

const LogoutButton = styled(NavItem)`
    margin-top: auto;
    margin-bottom: 30px;
    color: #9ca3af;

    &:hover {
        color: #ef4444;
        background-color: rgba(239, 68, 68, 0.1);
    }
`;

export default MainNavbar;

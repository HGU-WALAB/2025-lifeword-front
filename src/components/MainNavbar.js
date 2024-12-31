import React from 'react';
import styled from 'styled-components';
import { Book, Zap, Search, Bookmark, LogOut } from 'lucide-react';
import LogoWhite from '../assets/LogoWhite.png';

const MainNavbar = () => {
    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('kakaoUID');

        window.location.reload();
    };

    return (
        <NavContainer>
            <LogoWrapper>
                <Logo src={LogoWhite} alt="BIBLY" />
            </LogoWrapper>
            <MenuContainer>
                <MenuItem>
                    <Book size={24} />
                    <span>전체 성경 읽기</span>
                </MenuItem>
                <MenuItem>
                    <Zap size={24} />
                    <span>빠른 성경 읽기</span>
                </MenuItem>
                <MenuItem>
                    <Search size={24} />
                    <span>상세 검색</span>
                </MenuItem>
                <MenuItem>
                    <Bookmark size={24} />
                    <span>북마크</span>
                </MenuItem>
            </MenuContainer>
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

const LogoWrapper = styled.div`
    padding: 20px 0;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Logo = styled.img`
    width: 170px;
    height: auto;
`;

const MenuContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 20px;
`;

const MenuItem = styled.button`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    width: 100%;
    color: #9ca3af;
    border: none;
    background: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: #2d2d2d;
        color: #ffffff;
    }
`;

const LogoutButton = styled(MenuItem)`
    margin-top: auto;
    margin-bottom: 30px;
    color: #9ca3af;

    &:hover {
        color: #ef4444;
        background-color: rgba(239, 68, 68, 0.1);
    }
`;

export default MainNavbar;

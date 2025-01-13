import React from 'react';
import styled from 'styled-components';
import { Zap, Search, Bookmark, LogOut, PlusCircle, BookOpen } from 'lucide-react';
import LogoWhite from '../assets/LogoWhite.png';

const MainNavbar = ({ onPageChange, currentPage }) => {
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
                <MenuItem onClick={() => onPageChange('quick')} active={currentPage === 'quick'}>
                    <Zap size={24} />
                    <span>빠른 성경 읽기</span>
                </MenuItem>
                <MenuItem onClick={() => onPageChange('search')} active={currentPage === 'search'}>
                    <Search size={24} />
                    <span>상세 검색</span>
                </MenuItem>
                <MenuItem onClick={() => onPageChange('bookmark')} active={currentPage === 'bookmark'}>
                    <Bookmark size={24} />
                    <span>북마크</span>
                </MenuItem>
                <MenuItem onClick={() => onPageChange('sermon-list')} active={currentPage === 'sermon-list'}>
                    <BookOpen size={24} />
                    <span>설교 찾기</span>
                </MenuItem>
                <MenuItem onClick={() => onPageChange('add-sermon')} active={currentPage === 'add-sermon'}>
                    <PlusCircle size={24} />
                    <span>설교 추가하기</span>
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

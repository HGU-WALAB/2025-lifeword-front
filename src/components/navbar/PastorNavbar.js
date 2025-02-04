import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Zap, Search, Bookmark, LogOut, PlusCircle, BookOpen, User, ChevronLeft } from 'lucide-react';
import { useRecoilState } from 'recoil';
import { isNavExpandedState } from '../../recoil/atoms';
import LogoWhite from '../../assets/LogoWhite.png';
import { NavContainer, LogoContainer, Logo, NavItems, NavItem, LogoutButton, ToggleButton } from './NavbarStyles';
import { useLogout } from './navbarUtils';

const PastorNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const logout = useLogout();
    const [isExpanded, setIsExpanded] = useRecoilState(isNavExpandedState);

    const isActive = (path) => {
        if (path === '/sermon-list') {
            return location.pathname.includes('/main/sermon-list');
        }
        return location.pathname === `/main${path}` || (path === '/quick-reading' && location.pathname === '/main');
    };

    return (
        <NavContainer isExpanded={isExpanded}>
            <ToggleButton isExpanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)}>
                <ChevronLeft />
            </ToggleButton>
            <LogoContainer>
                <Logo src={LogoWhite} alt="Bibly Logo" onClick={() => navigate('/main')} isExpanded={isExpanded} />
            </LogoContainer>
            <NavItems>
                <NavItem
                    onClick={() => navigate('/main/quick-reading')}
                    active={isActive('/quick-reading')}
                    isExpanded={isExpanded}
                >
                    <Zap size={24} />
                    <span>빠른 성경 읽기</span>
                </NavItem>
                <NavItem onClick={() => navigate('/main/search')} active={isActive('/search')} isExpanded={isExpanded}>
                    <Search size={24} />
                    <span>검색</span>
                </NavItem>
                <NavItem
                    onClick={() => navigate('/main/bookmarks')}
                    active={isActive('/bookmarks')}
                    isExpanded={isExpanded}
                >
                    <Bookmark size={24} />
                    <span>북마크</span>
                </NavItem>
                <NavItem
                    onClick={() => navigate('/main/add-sermon')}
                    active={isActive('/add-sermon')}
                    isExpanded={isExpanded}
                >
                    <PlusCircle size={24} />
                    <span>설교 작성</span>
                </NavItem>
                <NavItem
                    onClick={() => navigate('/main/sermon-list')}
                    active={isActive('/sermon-list')}
                    isExpanded={isExpanded}
                >
                    <BookOpen size={24} />
                    <span>설교 목록</span>
                </NavItem>
                <NavItem onClick={() => navigate('/main/mypage')} active={isActive('/mypage')} isExpanded={isExpanded}>
                    <User size={24} />
                    <span>마이페이지</span>
                </NavItem>
            </NavItems>
            <LogoutButton onClick={logout} isExpanded={isExpanded}>
                <LogOut size={24} />
                <span>로그아웃</span>
            </LogoutButton>
        </NavContainer>
    );
};

export default PastorNavbar;

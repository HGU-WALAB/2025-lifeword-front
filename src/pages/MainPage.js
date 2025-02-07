import React from 'react';
import styled from 'styled-components';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainNavbar from '../components/MainNavbar';
import QuickReadingPage from '../components/bible/QuickReadingPage';
import SearchPage from '../components/bible/SearchPage';
import AddSermonPage from '../components/sermon/AddSermonPage';
import EditSermonPage from '../components/sermon/EditSermonPage';
import SermonListPage from '../components/sermon/SermonListPage';
import SermonDetailPage from '../components/sermon/SermonDetailPage';
import AdminPage from '../components/admin/AdminPage';
import UserManagementPage from '../components/admin/UserManagementPage';
import SermonManagementPage from '../components/admin/SermonManagementPage';
import MyPage from '../components/mypage/MyPage';
import { useUserState } from '../recoil/utils';
import { useRecoilValue } from 'recoil';
import { isNavExpandedState } from '../recoil/atoms';

const MainPage = () => {
    const { isAdmin } = useUserState();
    const isExpanded = useRecoilValue(isNavExpandedState);

    return (
        <Container>
            <MainNavbar />
            <MainContent isExpanded={isExpanded}>
                <Routes>
                    <Route path="/" element={<Navigate to="/main/quick-reading" replace />} />
                    <Route path="/quick-reading" element={<QuickReadingPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/add-sermon" element={<AddSermonPage />} />
                    <Route path="/sermon-list/*" element={<SermonListLayout />} />
                    <Route path="/mypage" element={<MyPage />} />
                    {isAdmin && (
                        <>
                            <Route path="/admin" element={<AdminPage />} />
                            <Route path="/admin/users" element={<UserManagementPage />} />
                            <Route path="/admin/sermons/*" element={<AdminSermonLayout />} />
                        </>
                    )}
                </Routes>
            </MainContent>
        </Container>
    );
};

const SermonListLayout = () => {
    return (
        <SermonListContainer>
            <Routes>
                <Route path="/" element={<SermonListPage />} />
                <Route path="/detail/:id" element={<SermonDetailPage />} />
                <Route path="/edit/:id" element={<EditSermonPage />} />
            </Routes>
        </SermonListContainer>
    );
};

const AdminSermonLayout = () => {
    return (
        <SermonListContainer>
            <Routes>
                <Route path="/" element={<SermonManagementPage />} />
                <Route path="/detail/:id" element={<SermonDetailPage />} />
                <Route path="/edit/:id" element={<EditSermonPage />} />
            </Routes>
        </SermonListContainer>
    );
};

const Container = styled.div`
    display: flex;
    min-height: 100vh;
    background-color: #ffffff;
    
    
    
`;
const MainContent = styled.div`
    flex: 1;
    position: relative;
    margin-left: ${(props) => (props.isExpanded ? '380px' : '180px')};
    margin-right: 60px;
    width: ${(props) => (props.isExpanded ? 'calc(100vw - 280px)' : 'calc(100vw - 80px)')};
    transition: all 0.3s ease;
    background-color: #f5f5f5;
    min-height: 100vh;
`;

const SermonListContainer = styled.div`
    display: flex;
    min-height: 100vh;
    background-color: #ffffff;
`;

export default MainPage;

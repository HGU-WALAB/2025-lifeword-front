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
import SermonDetailPageAdmin from '../components/admin/SermonDetailPageAdmin';
import AdminPage from '../components/admin/AdminPage';
import UserManagementPage from '../components/admin/UserManagementPage';
import SermonManagementPage from '../components/admin/SermonManagementPage';
import MyPage from '../components/mypage/MyPage';
import { useUserState } from '../recoil/utils';
import { useRecoilValue } from 'recoil';
import { isNavExpandedState } from '../recoil/atoms';
import BookmarkSermonDetailPage from '../components/mypage/BookmarkSermonDetailPage';
import CreateVersionPage from '../components/sermon/CreateVersionPage';
import EditVersionPage from '../components/sermon/EditVersionPage';

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
                    <Route path="mypage/sermon/:id" element={<BookmarkSermonDetailPage />} />
                    {isAdmin && (
                        <>
                            <Route path="/admin" element={<AdminPage />} />
                            <Route path="/admin/users" element={<UserManagementPage />} />
                            <Route path="/admin/sermons/*" element={<AdminSermonLayout />} />
                        </>
                    )}
                    <Route path="/sermons/:id/create-version" element={<CreateVersionPage />} />
                    <Route path="/admin/sermons/:id/create-version" element={<CreateVersionPage />} />
                    <Route path="/sermons/:id/versions/:textId/edit" element={<EditVersionPage />} />
                    <Route path="/admin/sermons/:id/versions/:textId/edit" element={<EditVersionPage />} />
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
                <Route path="/detail/:id" element={<SermonDetailPageAdmin />} />
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
    margin-left: ${(props) => (props.isExpanded ? '320px' : '120px')};
    margin-right: 0px;
    transition: all 0.3s ease;
    min-height: 100vh;
`;

const SermonListContainer = styled.div`
    display: flex;
    min-height: 100vh;
    background-color: #ffffff;
`;

export default MainPage;

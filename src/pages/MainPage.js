import React from 'react';
import styled from 'styled-components';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainNavbar from '../components/MainNavbar';
import QuickReadingPage from '../components/QuickReadingPage';
import SearchPage from '../components/SearchPage';
import BookmarkPage from '../components/BookmarkPage';
import AddSermonPage from '../components/AddSermonPage';
import EditSermonPage from '../components/EditSermonPage';
import SermonListPage from '../components/SermonListPage';
import SermonDetailPage from '../components/SermonDetailPage';
import AdminPage from '../components/AdminPage';
import UserManagementPage from '../components/UserManagementPage';
import SermonManagementPage from '../components/SermonManagementPage';

const MainPage = () => {
    return (
        <Container>
            <MainNavbar />
            <MainContent>
                <Routes>
                    <Route path="/" element={<Navigate to="/main/quick-reading" replace />} />
                    <Route path="/quick-reading" element={<QuickReadingPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/bookmarks" element={<BookmarkPage />} />
                    <Route path="/add-sermon" element={<AddSermonPage />} />
                    <Route path="/edit-sermon/:id" element={<EditSermonPage />} />
                    <Route path="/sermon-list/*" element={<SermonListLayout />} />
                    {localStorage.getItem('admin') === 'true' && <Route path="/admin" element={<AdminPage />} />}
                    {localStorage.getItem('admin') === 'true' && (
                        <Route path="/admin/users" element={<UserManagementPage />} />
                    )}
                    {localStorage.getItem('admin') === 'true' && (
                        <Route path="/admin/sermons" element={<SermonManagementPage />} />
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
`;

const SermonListContainer = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
`;

export default MainPage;

import React from 'react';
import styled from 'styled-components';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainNavbar from '../components/MainNavbar';
import QuickReadingPage from '../components/QuickReadingPage';
import SearchPage from '../components/SearchPage';
import BookmarkPage from '../components/BookmarkPage';
import AddSermonPage from '../components/AddSermonPage';
import SermonListPage from '../components/SermonListPage';
import AdminPage from '../components/AdminPage';

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
                    <Route path="/sermon-list" element={<SermonListPage />} />
                    {localStorage.getItem('admin') === 'true' && <Route path="/admin" element={<AdminPage />} />}
                </Routes>
            </MainContent>
        </Container>
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

export default MainPage;

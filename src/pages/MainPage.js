import React, { useState } from 'react';
import styled from 'styled-components';
import MainNavbar from '../components/MainNavbar';
import QuickReadingPage from '../components/QuickReadingPage';
import SearchPage from '../components/SearchPage';
import BookmarkPage from '../components/BookmarkPage';
import SermonListPage from '../components/SermonListPage';
import AddSermonPage from '../components/AddSermonPage';

const MainPage = () => {
    const [currentPage, setCurrentPage] = useState('quick');

    const renderPage = () => {
        switch (currentPage) {
            case 'quick':
                return <QuickReadingPage />;
            case 'search':
                return <SearchPage />;
            case 'bookmark':
                return <BookmarkPage />;
            case 'sermon-list':
                return <SermonListPage />;
            case 'add-sermon':
                return <AddSermonPage />;
            default:
                return <QuickReadingPage />;
        }
    };

    return (
        <Container>
            <MainNavbar onPageChange={setCurrentPage} currentPage={currentPage} />
            {renderPage()}
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    min-height: 100vh;
    background-color: #ffffff;
`;

export default MainPage;

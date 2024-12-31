import React, { useState } from 'react';
import styled from 'styled-components';
import MainNavbar from '../components/MainNavbar';
import BibleReadingPage from '../components/BibleReadingPage';
import QuickReadingPage from '../components/QuickReadingPage';
import SearchPage from '../components/SearchPage';
import BookmarkPage from '../components/BookmarkPage';

const MainPage = () => {
    const [currentPage, setCurrentPage] = useState('bible');

    const renderPage = () => {
        switch (currentPage) {
            case 'bible':
                return <BibleReadingPage />;
            case 'quick':
                return <QuickReadingPage />;
            case 'search':
                return <SearchPage />;
            case 'bookmark':
                return <BookmarkPage />;
            default:
                return <BibleReadingPage />;
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

import React from 'react';
import styled from 'styled-components';
import MainNavbar from '../components/MainNavbar';

const MainPage = () => {
    return (
        <Container>
            <MainNavbar />
        </Container>
    );
};

const Container = styled.div`
    display: flex;
`;

export default MainPage;

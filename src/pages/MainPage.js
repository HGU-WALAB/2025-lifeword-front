import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const MainPage = () => {
    return (
        <Container>
            <h1>메인 페이지</h1>
        </Container>
    );
};

export default MainPage;

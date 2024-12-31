import React from 'react';
import styled from 'styled-components';

const QuickReadingPage = () => {
    return (
        <Container>
            <h1>빠른 성경 읽기</h1>
            <p>여기에 빠른 성경 읽기 기능이 구현될 예정입니다.</p>
        </Container>
    );
};

const Container = styled.div`
    padding: 40px;
    margin-left: 300px;
    width: 100vw;
    min-width: 50vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f5f5f5;
    color: #2d2d2d;
`;

export default QuickReadingPage;

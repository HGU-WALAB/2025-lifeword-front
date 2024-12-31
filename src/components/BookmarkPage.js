import React from 'react';
import styled from 'styled-components';

const BookmarkPage = () => {
    return (
        <Container>
            <h1>북마크</h1>
            <p>여기에 북마크된 성경 구절들이 표시될 예정입니다.</p>
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

export default BookmarkPage;

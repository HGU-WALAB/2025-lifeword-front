import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { getPublicSermons, getUserSermons, searchSermons } from '../../services/APIService';
import { useUserState } from '../../recoil/utils';

const SermonListPage = () => {
    return (
        <Container>
            <Header></Header>
        </Container>
    );
};

const Container = styled.div`
    margin-left: 40px;
    padding: 40px;
    width: calc(100vw);
    min-height: 91vh;
    background-color: #f5f5f5;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    color: #333;
    margin-bottom: 0.5rem;
    font-weight: 600;
`;

const Description = styled.p`
    color: #666;
    font-size: 1.1rem;
`;

const LoadingText = styled.div`
    text-align: center;
    padding: 40px;
    color: #666;
    grid-column: 1 / -1;
    font-size: 1.1rem;
`;

const Header = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 30px;
`;

export default SermonListPage;

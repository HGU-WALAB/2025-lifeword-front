import React from 'react';
import styled from 'styled-components';
import { Users, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
    const navigate = useNavigate();

    return (
        <Container>
            <Title>관리자 페이지</Title>
            <Description>관리자 전용 페이지입니다.</Description>

            <CardGrid>
                <Card onClick={() => navigate('/main/admin/users')}>
                    <CardIcon>
                        <Users size={24} />
                    </CardIcon>
                    <CardContent>
                        <CardTitle>사용자 관리</CardTitle>
                        <CardDescription>사용자 정보 및 권한을 관리합니다.</CardDescription>
                    </CardContent>
                </Card>

                <Card>
                    <CardIcon>
                        <BookOpen size={24} />
                    </CardIcon>
                    <CardContent>
                        <CardTitle>설교 관리</CardTitle>
                        <CardDescription>등록된 설교를 관리합니다.</CardDescription>
                    </CardContent>
                </Card>
            </CardGrid>
        </Container>
    );
};

const Container = styled.div`
    margin-left: 320px;
    padding: 40px;
    width: calc(100vw - 400px);
    min-height: 92vh;
    background-color: #f5f5f5;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    color: #333;
    margin-bottom: 1rem;
`;

const Description = styled.p`
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 2rem;
`;

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    max-width: 800px;
`;

const Card = styled.div`
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 20px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
`;

const CardIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4f3296;
`;

const CardContent = styled.div`
    flex: 1;
`;

const CardTitle = styled.h3`
    font-size: 1.25rem;
    color: #333;
    margin-bottom: 4px;
`;

const CardDescription = styled.p`
    font-size: 0.9rem;
    color: #666;
    margin: 0;
`;

export default AdminPage;

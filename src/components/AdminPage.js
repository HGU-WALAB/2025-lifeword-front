import React from 'react';
import styled from 'styled-components';

const AdminPage = () => {
    return (
        <Container>
            <Title>관리자 페이지</Title>
            <Description>관리자 전용 페이지입니다.</Description>

            <Section>
                <SectionTitle>사용자 관리</SectionTitle>
                {/* 사용자 관리 기능 추가 예정 */}
            </Section>

            <Section>
                <SectionTitle>설교 관리</SectionTitle>
                {/* 설교 관리 기능 추가 예정 */}
            </Section>
        </Container>
    );
};

const Container = styled.div`
    padding: 40px;
    max-width: 1200px;
    margin: 0 auto;
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

const Section = styled.section`
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 1rem;
`;

export default AdminPage;

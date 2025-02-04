import React, { useState } from 'react';
import styled from 'styled-components';
import { User, Mail, Bookmark, Shield, Award, Lock } from 'lucide-react';
import PasswordModal from "./PasswordModal";
import BookmarkPage from './BookmarkPage';
import { useUserState } from '../../recoil/utils';

const MyPage = () => {
    const [activeTab, setActiveTab] = useState('info');  // 'info' or 'bookmark'
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { userEmail, userJob: job, isAdmin } = useUserState();

    return (
        <Container>
            <PageHeader>
                <HeaderIcon>
                    <User size={32} />
                </HeaderIcon>
                <Title>마이페이지</Title>
            </PageHeader>

            <TabContainer>
                <TabButton
                    active={activeTab === 'info'}
                    onClick={() => setActiveTab('info')}
                >
                    <Lock size={20} /> 마이페이지 관리
                </TabButton>
                <TabButton
                    active={activeTab === 'bookmark'}
                    onClick={() => setActiveTab('bookmark')}
                >
                    <Bookmark size={20} /> 북마크 관리
                </TabButton>
            </TabContainer>

            {activeTab === 'info' ? (
                <ContentWrapper>
                    <InfoSection>
                        <InfoCard>
                            <Label>이메일</Label>
                            <Value>{userEmail}</Value>
                        </InfoCard>

                        <InfoCard>
                            <Label>직분</Label>
                            <Value>{job}</Value>
                        </InfoCard>

                        <InfoCard>
                            <InfoHeader>
                                <CardIcon>
                                    <Shield size={20} />
                                </CardIcon>
                                <Label>권한</Label>
                            </InfoHeader>
                            <Value>{isAdmin ? '관리자' : '일반 사용자'}</Value>
                        </InfoCard>
                    </InfoSection>

                    <PasswordSection>
                        <SectionTitle>비밀번호 관리</SectionTitle>
                        <ChangePasswordButton onClick={() => setShowPasswordModal(true)}>
                            비밀번호 변경하기
                        </ChangePasswordButton>

                        {showPasswordModal && (
                            <PasswordModal
                                newPassword={''}
                                setNewPassword={() => {}}
                                newPasswordConfirm={''}
                                setNewPasswordConfirm={() => {}}
                                passwordMatchMessage={''}
                                handlePasswordCheckChange={() => {}}
                                handlePasswordConfirmChange={() => {}}
                                handlePasswordChange={() => {}}
                                onClose={() => setShowPasswordModal(false)}
                            />
                        )}
                    </PasswordSection>
                </ContentWrapper>
            ) : (
                <BookmarkSection>
                    <BookmarkPage />
                </BookmarkSection>
            )}
        </Container>
    );
};



const Container = styled.div`
    margin-left: 100px;
    padding: 40px;
    width: 100vw;
    min-height: 92vh;
    background-color: #f5f5f5;
`;

const PageHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
`;

const HeaderIcon = styled.div`
    background: #4f3296;
    color: white;
    padding: 1rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    color: #333;
    margin-bottom: 0.5rem;
    font-weight: 600;
`;

const TabContainer = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
`;

const TabButton = styled.button`
    background: ${(props) => (props.active ? '#4f3296' : '#e9ecef')};
    color: ${(props) => (props.active ? 'white' : '#495057')};
    padding: 1rem 1.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background-color 0.2s ease;

    &:hover {
        background: ${(props) => (props.active ? '#3a2570' : '#d6d6d6')};
    }
`;

const ContentWrapper = styled.div`
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-width: 800px;
`;

const InfoSection = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
`;

const InfoCard = styled.div`
    background: #f3f4f6;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const Label = styled.div`
    font-weight: bold;
    color: #666;
    margin-bottom: 0.5rem;
`;

const Value = styled.div`
    font-size: 1.1rem;
    color: #333;
`;

const PasswordSection = styled.div`
    padding-top: 2rem;
    border-top: 1px solid #eee;
`;

const SectionTitle = styled.h2`
    font-size: 1.2rem;
    color: #333;
    margin-bottom: 1.5rem;
`;

const InfoHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
`;

const CardIcon = styled.div`
    color: #4f3296;
    display: flex;
    align-items: center;
`;

const ChangePasswordButton = styled.button`
    background: #4f3296;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s ease;

    &:hover {
        background: #3a2570;
    }
`;

const BookmarkSection = styled.div`
    padding-top: 2rem;
    border-top: 1px solid #eee;
`;
export default MyPage;

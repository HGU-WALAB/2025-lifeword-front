import React, { useState } from 'react';
import styled from 'styled-components';
import { User, Mail, Bookmark, Shield, Award, Lock } from 'lucide-react';
import { setUserPassword } from '../../services/APIService';
import PasswordModal from "./PasswordModal";
import BookmarkPage from './BookmarkPage';
import { useUserState } from '../../recoil/utils';

const MyPage = () => {
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [passwordMatchMessage, setPasswordMatchMessage] = useState('');
    const [activeTab, setActiveTab] = useState('info');  // 'info' or 'bookmark'
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { userEmail, userJob: job, isAdmin } = useUserState();



    const handlePasswordChange = async () => {
        if (!newPassword) {
            alert('새로운 비밀번호를 입력해주세요.');
            return;
        }
        // 비밀번호 변경 API 호출
        const response = await setUserPassword(userEmail, newPassword);
        if (response.success) {
            alert('비밀번호가 성공적으로 변경되었습니다.');
            setShowPasswordModal(false);
            setNewPassword('');
            setNewPasswordConfirm('');
        } else {
            alert('기존 비밀번호와 동일한 비밀번호 입니다.');
        }
    };


    const handlePasswordCheckChange = (value) => {
        setNewPassword(value);
        if (!newPasswordConfirm) {
            setPasswordMatchMessage('');
            return;
        }
        setPasswordMatchMessage(value === newPasswordConfirm ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.');
    };

    const handlePasswordConfirmChange = (value) => {
        setNewPasswordConfirm(value);
        if (!newPassword) {
            setPasswordMatchMessage('');
            return;
        }
        setPasswordMatchMessage(value === newPassword ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.');
    };


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
                            <InfoHeader>
                                <CardIcon>
                                    <Mail size={20} />
                                </CardIcon>
                                <Label>이메일</Label>
                            </InfoHeader>
                            <Value>{userEmail}</Value>
                        </InfoCard>

                        <InfoCard>
                            <InfoHeader>
                                <CardIcon>
                                    <Award size={20} />
                                </CardIcon>
                                <Label>직분</Label>
                            </InfoHeader>
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
                        <SectionTitle>
                            <Lock size={20} />
                            비밀번호 관리
                        </SectionTitle>
                        <ChangePasswordButton onClick={() => setShowPasswordModal(true)}>
                            비밀번호 변경하기
                        </ChangePasswordButton>

                        {showPasswordModal && (
                            <PasswordModal
                                newPassword={newPassword}
                                setNewPassword={setNewPassword}
                                newPasswordConfirm={newPasswordConfirm}
                                setNewPasswordConfirm={setNewPasswordConfirm}
                                passwordMatchMessage={passwordMatchMessage}
                                handlePasswordCheckChange={handlePasswordCheckChange}
                                handlePasswordConfirmChange={handlePasswordConfirmChange}
                                handlePasswordChange={handlePasswordChange}
                                onClose={() => {
                                    setShowPasswordModal(false);
                                    setNewPassword('');
                                    setNewPasswordConfirm('');
                                }}
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

    @media (max-width: 1200px) {
        width: calc(100vw - 320px);
        padding: 30px;
    }

    @media (max-width: 768px) {
        padding: 20px;
        margin-left: 280px;
        width: calc(100vw - 280px);
    }
`;

const PageHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;

    @media (max-width: 480px) {
        flex-direction: column;
        text-align: center;
    }
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

    @media (max-width: 768px) {
        font-size: 2rem;
    }

    @media (max-width: 480px) {
        font-size: 1.8rem;
    }
`;

const ContentWrapper = styled.div`
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-width: 800px;

    @media (max-width: 768px) {
        padding: 1.5rem;
    }
`;

const InfoSection = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;

    @media (max-width: 992px) {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
`;

const InfoCard = styled.div`
    background: #f3f4f6;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 768px) {
        padding: 1.2rem;
    }
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

const Label = styled.span`
    font-weight: 500;
    color: #666;
    font-size: 0.9rem;
`;

const Value = styled.div`
    color: #333;
    font-size: 1.1rem;
    font-weight: 500;
    margin-top: 0.5rem;
`;

const PasswordSection = styled.div`
    padding-top: 2rem;
    border-top: 1px solid #eee;
`;

const SectionTitle = styled.h2`
    font-size: 1.2rem;
    color: #333;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;


const ChangePasswordButton = styled.button`
    background: #4f3296;
    color: white;
    border: none;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;
    font-weight: 500;
    width: 100%;

    &:hover {
        background: #3a2570;
        transform: translateY(-2px);
    }

    @media (max-width: 768px) {
        padding: 0.8rem 1.2rem;
        font-size: 0.9rem;
    }
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

const BookmarkSection = styled.div`
    padding-top: 2rem;
    border-top: 1px solid #eee;
`;
export default MyPage;

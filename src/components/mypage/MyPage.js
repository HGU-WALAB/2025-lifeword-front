import React, { useState } from 'react';
import styled from 'styled-components';
import { User, Mail, Shield, Award, Lock } from 'lucide-react';
import { setUserPassword } from '../../services/APIService';
import PasswordModal from './PasswordModal';
import BookmarkPage from './BookmarkPage';
import { useUserState } from '../../recoil/utils';

const MyPage = () => {
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [passwordMatchMessage, setPasswordMatchMessage] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { userEmail, userJob: job, isAdmin, userName } = useUserState();

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
        setPasswordMatchMessage(
            value === newPasswordConfirm ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'
        );
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
                <HeaderTitle>마이페이지</HeaderTitle>
                <HeaderDescription>계정 정보 및 북마크를 관리하세요</HeaderDescription>
            </PageHeader>

            <Grid>
                {/* 프로필 카드 */}
                <ProfileCard>
                    <ProfileHeader>
                        <ProfileAvatar>
                            <User size={32} color="#fff" />
                        </ProfileAvatar>
                        <ProfileInfo>
                            <ProfileName>{userName}</ProfileName>
                            <ProfileEmail>{userEmail}</ProfileEmail>
                        </ProfileInfo>
                    </ProfileHeader>
                    <ProfileDivider />
                    <ProfileDetails>
                        <DetailItem>
                            <DetailIcon>
                                <Award size={18} />
                            </DetailIcon>
                            <DetailContent>
                                <DetailLabel>직분</DetailLabel>
                                <DetailValue>{job}</DetailValue>
                            </DetailContent>
                        </DetailItem>
                        <DetailItem>
                            <DetailIcon>
                                <Shield size={18} />
                            </DetailIcon>
                            <DetailContent>
                                <DetailLabel>권한</DetailLabel>
                                <DetailValue>{isAdmin ? '관리자' : '일반 사용자'}</DetailValue>
                            </DetailContent>
                        </DetailItem>
                    </ProfileDetails>
                </ProfileCard>

                {/* 보안 설정 카드 */}
                <SecurityCard>
                    <CardTitle>
                        <Lock size={20} />
                        보안 설정
                    </CardTitle>
                    <SecurityContent>
                        <SecurityText>주기적인 비밀번호 변경으로 계정을 안전하게 보호하세요.</SecurityText>
                        <ChangePasswordButton onClick={() => setShowPasswordModal(true)}>
                            비밀번호 변경
                        </ChangePasswordButton>
                    </SecurityContent>
                </SecurityCard>
            </Grid>

            {/* 북마크 섹션 */}
            <BookmarkSection>
                <BookmarkPage />
            </BookmarkSection>

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
        </Container>
    );
};

const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
`;

const PageHeader = styled.div`
    margin-bottom: 2rem;
`;

const HeaderTitle = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
`;

const HeaderDescription = styled.p`
    color: #666;
    font-size: 1rem;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
`;

const ProfileCard = styled.div`
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const ProfileHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
`;

const ProfileAvatar = styled.div`
    width: 60px;
    height: 60px;
    background: #4f3296;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ProfileInfo = styled.div`
    flex: 1;
`;

const ProfileName = styled.h2`
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
`;

const ProfileEmail = styled.p`
    color: #666;
    font-size: 0.9rem;
    margin: 0.25rem 0 0 0;
`;

const ProfileDivider = styled.hr`
    border: none;
    border-top: 1px solid #eee;
    margin: 1rem 0;
`;

const ProfileDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const DetailItem = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const DetailIcon = styled.div`
    color: #4f3296;
`;

const DetailContent = styled.div`
    flex: 1;
`;

const DetailLabel = styled.p`
    color: #666;
    font-size: 0.85rem;
    margin: 0;
`;

const DetailValue = styled.p`
    color: #1a1a1a;
    font-weight: 500;
    margin: 0.25rem 0 0 0;
`;

const SecurityCard = styled.div`
    background: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const CardTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    color: #1a1a1a;
    margin: 0 0 1rem 0;
`;

const SecurityContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const SecurityText = styled.p`
    color: #666;
    font-size: 0.9rem;
    margin: 0;
`;

const ChangePasswordButton = styled.button`
    background: #4f3296;
    color: white;
    border: none;
    padding: 0.75rem 1rem;
    width: 20rem;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
        background: #3a2570;
        transform: translateY(-1px);
    }
`;

const BookmarkSection = styled.div`
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

export default MyPage;

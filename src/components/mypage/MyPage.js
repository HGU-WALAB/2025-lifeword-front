import React, { useState } from 'react';
import styled from 'styled-components';
import { setUserPassword } from '../../services/APIService';
import { useUserState } from '../../recoil/utils';

const MyPage = () => {
    const [newPassword, setNewPassword] = useState('');
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const { userId, userEmail, userName, userJob: job, isAdmin } = useUserState();

    const handlePasswordChange = async () => {
        try {
            if (!newPassword) {
                alert('새로운 비밀번호를 입력해주세요.');
                return;
            }

            const response = await setUserPassword(userEmail, newPassword);

            if (response.success) {
                alert('비밀번호가 성공적으로 변경되었습니다.');
                setNewPassword('');
                setShowPasswordChange(false);
            } else {
                alert('비밀번호 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            alert('비밀번호 변경 중 오류가 발생했습니다.');
        }
    };

    return (
        <Container>
            <Title>마이페이지</Title>
            <ContentWrapper>
                <InfoSection>
                    <InfoItem>
                        <Label>이메일</Label>
                        <Value>{userEmail}</Value>
                    </InfoItem>
                    {/* <InfoItem>
                        <Label>이름</Label>
                        <Value>{userName}</Value>
                    </InfoItem> */}
                    <InfoItem>
                        <Label>직분</Label>
                        <Value>{job}</Value>
                    </InfoItem>
                    <InfoItem>
                        <Label>권한</Label>
                        <Value>{isAdmin ? '관리자' : '일반 사용자'}</Value>
                    </InfoItem>
                </InfoSection>

                <PasswordSection>
                    {!showPasswordChange ? (
                        <ChangePasswordButton onClick={() => setShowPasswordChange(true)}>
                            비밀번호 변경
                        </ChangePasswordButton>
                    ) : (
                        <PasswordChangeForm>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="새로운 비밀번호 입력"
                            />
                            <ButtonGroup>
                                <SubmitButton onClick={handlePasswordChange}>변경하기</SubmitButton>
                                <CancelButton
                                    onClick={() => {
                                        setShowPasswordChange(false);
                                        setNewPassword('');
                                    }}
                                >
                                    취소
                                </CancelButton>
                            </ButtonGroup>
                        </PasswordChangeForm>
                    )}
                </PasswordSection>
            </ContentWrapper>
        </Container>
    );
};

const Container = styled.div`
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
`;

const Title = styled.h1`
    font-size: 2rem;
    color: #333;
    margin-bottom: 2rem;
`;

const ContentWrapper = styled.div`
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const InfoSection = styled.div`
    margin-bottom: 2rem;
`;

const InfoItem = styled.div`
    margin-bottom: 1rem;
`;

const Label = styled.span`
    font-weight: 500;
    color: #666;
    margin-right: 1rem;
`;

const Value = styled.span`
    color: #333;
`;

const PasswordSection = styled.div`
    padding-top: 2rem;
    border-top: 1px solid #eee;
`;

const ChangePasswordButton = styled.button`
    background: #4f3296;
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s;

    &:hover {
        background: #3a2570;
    }
`;

const PasswordChangeForm = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const Input = styled.input`
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    width: 100%;
    max-width: 300px;

    &:focus {
        outline: none;
        border-color: #4f3296;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
`;

const SubmitButton = styled(ChangePasswordButton)`
    background: #4f3296;
`;

const CancelButton = styled(ChangePasswordButton)`
    background: #666;

    &:hover {
        background: #555;
    }
`;

export default MyPage;

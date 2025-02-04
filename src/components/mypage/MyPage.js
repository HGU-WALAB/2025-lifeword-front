import React, { useState } from 'react';
import styled from 'styled-components';
import { setUserPassword } from '../../services/APIService';
import { useUserState } from '../../recoil/utils';
import { User, Mail, Shield, Award, Lock } from 'lucide-react';

const MyPage = () => {
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [passwordMatchMessage, setPasswordMatchMessage] = useState('');
    const { userEmail, userJob: job, isAdmin } = useUserState();

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
                setNewPasswordConfirm('');
                setShowPasswordChange(false);
            } else {
                alert('기존 비밀번호와 동일한 비밀번호 입니다.');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            alert('비밀번호 변경 중 오류가 발생했습니다.');
        }
    };
    const handlePasswordCheckChange = (value) => {
        setNewPassword(value);
        if(!newPasswordConfirm ){
            setPasswordMatchMessage('');
            return;
        }

        if (value === newPasswordConfirm) {
            setPasswordMatchMessage('비밀번호가 일치합니다.');
        } else {
            setPasswordMatchMessage('비밀번호가 일치하지 않습니다.');
        }

    };


    const handlePasswordConfirmChange = (value) => {
        setNewPasswordConfirm(value);
        if(!newPassword || !newPasswordConfirm){
            setPasswordMatchMessage('');
            return;
        }

        if (value === newPassword) {
            setPasswordMatchMessage('비밀번호가 일치합니다.');
        } else {
            setPasswordMatchMessage('비밀번호가 일치하지 않습니다.');
        }

    };

    return (
        <Container>
            <PageHeader>
                <HeaderIcon>
                    <User size={32} />
                </HeaderIcon>
                <Title>마이페이지</Title>
            </PageHeader>

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
                    {!showPasswordChange ? (
                        <ChangePasswordButton onClick={() => setShowPasswordChange(true)}>
                            비밀번호 변경하기
                        </ChangePasswordButton>
                    ) : (
                        <PasswordChangeForm>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => handlePasswordCheckChange(e.target.value)}
                                placeholder="새로운 비밀번호 입력"
                            />
                            <Input
                                type="password"
                                value={newPasswordConfirm}
                                onChange={(e) => handlePasswordConfirmChange(e.target.value)}
                                placeholder="새로운 비밀번호 확인"
                            />
                            <PasswordMessage isMatch={ newPasswordConfirm && newPassword && newPassword === newPasswordConfirm}>
                                {newPassword && newPasswordConfirm && passwordMatchMessage}
                            </PasswordMessage>
                            <ButtonGroup>
                                <SubmitButton
                                    onClick={handlePasswordChange}
                                    disabled={newPassword !== newPasswordConfirm || !newPassword || !newPasswordConfirm}
                                >
                                    변경하기
                                </SubmitButton>
                                <CancelButton
                                    onClick={() => {
                                        setShowPasswordChange(false);
                                        setNewPassword('');
                                        setNewPasswordConfirm('');
                                        setPasswordMatchMessage('');
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

// 스타일 컴포넌트 추가 부분
const PasswordMessage = styled.div`
    font-size: 0.9rem;
    color: ${(props) => (props.isMatch ? 'green' : 'red')};
    margin-top: -0.5rem;
    margin-bottom: 1rem;
`;

const Container = styled.div`
    margin-left: 320px;
    padding: 40px;
    width: calc(100vw - 400px);
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
    transition: transform 0.2s ease;
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

const PasswordChangeForm = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;

    @media (max-width: 768px) {
        max-width: 100%;
    }
`;

const Input = styled.input`
    padding: 1rem;
    border: 2px solid #eee;
    border-radius: 8px;
    font-size: 1rem;
    width: 100%;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #4f3296;
        box-shadow: 0 0 0 3px rgba(79, 50, 150, 0.1);
    }

    @media (max-width: 768px) {
        padding: 0.8rem;
        font-size: 0.9rem;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;

    @media (max-width: 480px) {
        flex-direction: column;
    }
`;

const SubmitButton = styled(ChangePasswordButton)`
    flex: 1;
`;

const CancelButton = styled(ChangePasswordButton)`
    flex: 1;
    background: #e9ecef;
    color: #495057;

    &:hover {
        background: #dee2e6;
    }
`;

export default MyPage;

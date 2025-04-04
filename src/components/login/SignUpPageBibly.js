import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { createUser, verifyEmail } from '../../services/APIService';
import { setupRecaptcha, requestPhoneVerification, verifyPhoneNumber } from '../../services/PhoneAuthService';
import { useSetUserState } from '../../recoil/utils';

const SignUpPageBibly = () => {
    const navigate = useNavigate();
    const setUserState = useSetUserState();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [churchName, setChurchName] = useState('');
    const [role, setRole] = useState('');
    const [province, setProvince] = useState('');

    const provinces = [
        '서울특별시',
        '부산광역시',
        '대구광역시',
        '인천광역시',
        '광주광역시',
        '대전광역시',
        '울산광역시',
        '세종특별자치시',
        '경기도',
        '강원도',
        '충청북도',
        '충청남도',
        '전라북도',
        '전라남도',
        '경상북도',
        '경상남도',
        '제주특별자치도',
    ];

    useEffect(() => {
        setupRecaptcha();
    }, []);

    const formatPhoneNumber = (value) => {
        if (!value) return value;
        const phoneNumber = value.replace(/[^\d]/g, '');
        if (phoneNumber.length <= 3) return phoneNumber;
        if (phoneNumber.length <= 7) return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
        return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
    };

    const handlePhoneChange = (e) => {
        const formattedPhone = formatPhoneNumber(e.target.value);
        if (formattedPhone.replace(/-/g, '').length <= 11) {
            setPhone(formattedPhone);
        }
    };

    const handleEmailVerification = async () => {
        try {
            const response = await verifyEmail(email);

            if (response.success) {
                if (response.data === true) {
                    setIsEmailVerified(false);
                    alert('이미 사용 중인 이메일입니다.');
                } else {
                    setIsEmailVerified(true);
                    alert('사용 가능한 이메일입니다.');
                }
            } else {
                alert('이메일 확인 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Email verification error:', error);
            alert('이메일 확인 중 오류가 발생했습니다.');
        }
    };

    const handleVerificationRequest = async () => {
        const response = await requestPhoneVerification(phone);
        if (response.success) {
            setShowVerification(true);
            alert('인증번호가 발송되었습니다.');
        } else {
            alert('인증번호 발송에 실패했습니다.');
        }
    };

    const handleVerificationSubmit = async () => {
        const response = await verifyPhoneNumber(verificationCode);
        if (response.success) {
            setIsPhoneVerified(true);
            alert('인증이 완료되었습니다.');
        } else {
            alert('인증에 실패했습니다.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isPhoneVerified) {
            alert('전화번호 인증이 필요합니다.');
            return;
        }
        if (!isEmailVerified) {
            alert('이메일 인증이 필요합니다.');
            return;
        }

        try {
            const userData = {
                oauthProvider: 'bibly',
                oauthUid: '',
                email: email,
                password: password,
                name: name,
                contact: phone,
                church: churchName,
                job: role === 'pastor' ? '목회자' : '평신도',
                place: province,
            };

            const response = await createUser(userData);
            if (response.success) {
                setUserState({
                    isLoggedIn: 'true',
                    userId: response.data.id,
                    userEmail: email,
                    userName: name,
                    job: role === 'pastor' ? '목회자' : '평신도',
                    admin: 'false',
                });
                alert('회원가입이 완료되었습니다.');
                navigate('/main', { replace: true });
            } else {
                throw new Error(response.message || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            alert(error.message || '회원가입에 실패했습니다.');
        }
    };

    return (
        <Container>
            <FormWrapper>
                <Title>회원가입</Title>
                <Description>LIFE WORD에서 사용할 정보를 입력해주세요.</Description>

                <div id="recaptcha-container"></div>

                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label>이메일</Label>
                        <EmailInputGroup>
                            <EmailInput
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="이메일을 입력하세요"
                                disabled={isEmailVerified}
                                required
                            />
                            <VerificationButton
                                type="button"
                                onClick={handleEmailVerification}
                                disabled={isEmailVerified || !email}
                            >
                                {isEmailVerified ? '인증완료' : '중복확인'}
                            </VerificationButton>
                        </EmailInputGroup>
                    </FormGroup>

                    <FormGroup>
                        <Label>비밀번호</Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>이름</Label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="이름을 입력하세요"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>교회 이름</Label>
                        <Input
                            type="text"
                            value={churchName}
                            onChange={(e) => setChurchName(e.target.value)}
                            placeholder="교회 이름을 입력하세요"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>직분</Label>
                        <Select value={role} onChange={(e) => setRole(e.target.value)} required>
                            <option value="">직분을 선택하세요</option>
                            <option value="pastor">목회자</option>
                            <option value="believer">평신도</option>
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label>주소</Label>
                        <Select value={province} onChange={(e) => setProvince(e.target.value)} required>
                            <option value="">광역시/도 선택</option>
                            {provinces.map((prov) => (
                                <option key={prov} value={prov}>
                                    {prov}
                                </option>
                            ))}
                        </Select>
                    </FormGroup>

                    <FormGroup>
                        <Label>전화번호</Label>
                        <PhoneInputGroup>
                            {isPhoneVerified ? (
                                <DisabledInput value={phone} disabled />
                            ) : (
                                <PhoneInput
                                    type="tel"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    placeholder="전화번호를 입력하세요"
                                    required
                                />
                            )}
                            <VerificationButton
                                type="button"
                                disabled={phone.replace(/-/g, '').length !== 11 || isPhoneVerified}
                                onClick={handleVerificationRequest}
                            >
                                {isPhoneVerified ? '인증완료' : '인증번호 받기'}
                            </VerificationButton>
                        </PhoneInputGroup>
                        {showVerification && (
                            <VerificationInputGroup>
                                {isPhoneVerified ? (
                                    <DisabledInput value={verificationCode} disabled />
                                ) : (
                                    <Input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        placeholder="인증번호 6자리를 입력하세요"
                                        maxLength="6"
                                    />
                                )}
                                <VerificationButton
                                    type="button"
                                    onClick={handleVerificationSubmit}
                                    disabled={isPhoneVerified}
                                >
                                    확인
                                </VerificationButton>
                            </VerificationInputGroup>
                        )}
                    </FormGroup>

                    <SubmitButton type="submit">가입 완료</SubmitButton>
                </Form>
            </FormWrapper>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: white;
    padding: 20px;
`;

const FormWrapper = styled.div`
    background: white;
    padding: 48px;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    width: 100%;
    max-width: 500px;
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
    margin-bottom: 2rem;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    color: #333;
    font-weight: 500;
    font-size: 0.9rem;
`;

const Input = styled.input`
    width: 93%;
    padding: 12px 16px;
    border: 2px solid #eee;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #4f3296;
    }
`;

const EmailInput = styled(Input)`
    flex: 1;
`;

const PhoneInput = styled(Input)`
    flex: 1;
`;

const DisabledInput = styled(Input)`
    background-color: #f5f5f5;
    color: #666;
`;

const EmailInputGroup = styled.div`
    display: flex;
    gap: 8px;
    width: 100%;
`;

const PhoneInputGroup = styled(EmailInputGroup)``;

const VerificationInputGroup = styled(EmailInputGroup)`
    margin-top: 8px;
`;

const Select = styled.select`
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #eee;
    border-radius: 8px;
    font-size: 1rem;
    background-color: white;
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #4f3296;
    }
`;

const VerificationButton = styled.button`
    padding: 12px 20px;
    background: ${(props) => {
        if (props.disabled) {
            return props.children === '인증완료' ? '#4CAF50' : '#cccccc';
        }
        return '#4f3296';
    }};
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover:not(:disabled) {
        background: #3a2570;
    }
`;

const SubmitButton = styled.button`
    width: 100%;
    padding: 16px;
    background: #4f3296;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 16px;

    &:hover {
        background: #3a2570;
    }
`;

export default SignUpPageBibly;

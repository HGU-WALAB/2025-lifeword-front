import React, { useState } from 'react';
import { ParallaxBanner } from 'react-scroll-parallax';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { OnboardingGlobalStyles } from '../styles/OnboardingGlobalStyles';
import LogoLong from '../assets/LogoLong.svg';
import LoginForm from '../components/login/LoginForm';

const Onboarding = () => {
    const [showLoginForm, setShowLoginForm] = useState(false);
    const navigate = useNavigate();

    const handleLogoClick = () => {
        navigate('/');
        window.location.reload();
    };

    return (
        <div style={{ height: '100vh' }}>
            <OnboardingGlobalStyles />
            <FixedLogo src={LogoLong} alt="LIFE WORD" onClick={handleLogoClick} />
            <ParallaxBanner
                layers={[
                    {
                        image: 'https://source.unsplash.com/random/1920x1080?business',
                        speed: -40,
                        scale: [1.4, 1, 'easeOutCubic'],
                        shouldAlwaysCompleteAnimation: true,
                        expanded: false,
                    },
                    {
                        speed: -25,
                        opacity: [0.5, 1],
                        expanded: true,
                        children: (
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background:
                                        'linear-gradient(90deg, rgba(184,6,218,0.8), rgba(249,137,226,0.8), rgba(30,129,235,0.8))',
                                    backgroundSize: '300% 300%',
                                    animation: 'gradient 8s alternate infinite',
                                }}
                            />
                        ),
                    },
                    {
                        speed: -15,
                        children: (
                            <>
                                <FloatingShape style={{ top: '25%', left: '20%', animationDelay: '0.5s' }} />
                                <FloatingShape style={{ top: '55%', right: '20%', animationDelay: '2.5s' }} />
                            </>
                        ),
                    },
                    {
                        speed: 20,
                        scale: [0.8, 1],
                        opacity: [0.5, 1],
                        children: (
                            <Content>
                                {showLoginForm ? (
                                    <LoginForm onClose={() => setShowLoginForm(false)} />
                                ) : (
                                    <>
                                        <MultiLineTitle>하나님의 말씀을 더 가까이, LIFE WORD</MultiLineTitle>
                                        <Description>지금 바로 시작해보세요!</Description>
                                        <LoginButtons>
                                            <KakaoLoginButton onClick={handleKakaoLogin}>
                                                카카오로 시작하기
                                            </KakaoLoginButton>
                                            <GoogleLoginButton onClick={handleGoogleLogin}>
                                                구글로 시작하기
                                            </GoogleLoginButton>
                                            <LoginButton onClick={() => setShowLoginForm(true)}>로그인하기</LoginButton>
                                        </LoginButtons>
                                    </>
                                )}
                            </Content>
                        ),
                    },
                ]}
                style={{
                    height: '100vh',
                    width: '100%',
                }}
            />
        </div>
    );
};

export default Onboarding;

const FixedLogo = styled.img`
    position: fixed;
    top: 2rem;
    left: 2rem;
    width: 170px;
    height: auto;
    z-index: 1000;
    opacity: 0;
    cursor: pointer;
    animation: fadeIn 0.8s ease forwards;

    @keyframes fadeIn {
        to {
            opacity: 1;
        }
    }
`;

const Content = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    text-align: center;
    padding: 20px;
    z-index: 2;
    width: 100%;
    max-width: 1200px;
`;

const Title = styled.h1`
    font-size: 5rem;
    margin-bottom: 2rem;
    font-weight: 300;
    transform: translateY(30px);
    opacity: 0;
    animation: slideUp 0.8s ease forwards;
    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5);
    letter-spacing: 2px;

    @keyframes slideUp {
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;

const Description = styled.p`
    font-size: 2rem;
    line-height: 1.6;
    opacity: 0;
    transform: translateY(30px);
    animation: slideUp 0.8s ease 0.2s forwards;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    max-width: 800px;
    margin: 0 auto;
`;

const FloatingShape = styled.div`
    position: absolute;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.18);

    @keyframes float {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-20px);
        }
    }
`;

const MultiLineTitle = styled(Title)`
    font-size: 4rem;
    white-space: pre-line;
    line-height: 1.3;
`;

const LoginButtons = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
    opacity: 0;
    transform: translateY(30px);
    animation: slideUp 0.8s ease 0.4s forwards;
    width: 300px;
    margin-left: auto;
    margin-right: auto;
`;

const KakaoLoginButton = styled.button`
    width: 100%;
    padding: 1rem 2rem;
    font-size: 1.8rem;
    background-color: #fee500;
    color: #000000;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
        transform: translateY(-2px);
    }
`;

const GoogleLoginButton = styled(KakaoLoginButton)`
    background-color: #ffffff;
    color: #000000;
    border: 1px solid #dddddd;
`;

const LoginButton = styled(GoogleLoginButton)`
    background-color: transparent;
    color: #ffffff;
    border: 1px solid #ffffff;

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
`;

const handleKakaoLogin = () => {
    const REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY;
    const REDIRECT_URI = process.env.REACT_APP_KAKAO_REDIRECT_URI;

    if (!REST_API_KEY || !REDIRECT_URI) {
        console.error('Required environment variables are missing');
        return;
    }

    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=account_email&state=kakao`;
    window.location.href = kakaoURL;
};

const handleGoogleLogin = () => {
    const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const REDIRECT_URI = process.env.REACT_APP_GOOGLE_REDIRECT_URI;

    if (!CLIENT_ID || !REDIRECT_URI) {
        console.error('Required environment variables are missing');
        return;
    }

    const googleURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=email profile&access_type=offline&prompt=consent&state=google`;
    window.location.href = googleURL;
};

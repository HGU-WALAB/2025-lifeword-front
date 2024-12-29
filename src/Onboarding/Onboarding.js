import React from 'react';
import { ParallaxBanner } from 'react-scroll-parallax';
import styled from 'styled-components';
import { OnboardingGlobalStyles } from '../styles/OnboardingGlobalStyles';
import LogoWhite from '../assets/LogoWhite.png';

const Onboarding = () => {
    return (
        <div style={{ height: '300vh' }}>
            <OnboardingGlobalStyles />
            <FixedLogo src={LogoWhite} alt="BIBLY" />
            {sections.map((section, index) => (
                <ParallaxBanner
                    key={index}
                    layers={[
                        {
                            image: section.background,
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
                                        background: section.gradient,
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
                                    {section.shapes.map((shape, i) => (
                                        <FloatingShape
                                            key={i}
                                            style={{
                                                ...shape,
                                                animationDelay: shape.delay,
                                            }}
                                        />
                                    ))}
                                </>
                            ),
                        },
                        {
                            speed: 20,
                            scale: [0.8, 1],
                            opacity: [0.5, 1],
                            children: (
                                <Content>
                                    {section.isBrandSection ? (
                                        <>
                                            <Title>{section.title}</Title>
                                            <BrandName>{section.description}</BrandName>
                                        </>
                                    ) : section.isLoginSection ? (
                                        <>
                                            <Title>{section.title}</Title>
                                            <LoginButton onClick={handleKakaoLogin}>카카오로 시작하기</LoginButton>
                                        </>
                                    ) : (
                                        <>
                                            <MultiLineTitle>{section.title}</MultiLineTitle>
                                            <Description>{section.description}</Description>
                                        </>
                                    )}
                                </Content>
                            ),
                        },
                    ]}
                    style={{
                        height: '100vh',
                        position: 'absolute',
                        top: `${index * 100}vh`,
                        left: 0,
                        width: '100%',
                        zIndex: sections.length - index,
                    }}
                />
            ))}
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

const BrandName = styled.h2`
    font-size: 6rem;
    font-weight: 700;
    margin-top: 2rem;
    opacity: 0;
    transform: translateY(30px);
    animation: slideUp 0.8s ease 0.3s forwards;
    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5);
    letter-spacing: 4px;
`;

const MultiLineTitle = styled(Title)`
    font-size: 4rem;
    white-space: pre-line;
    line-height: 1.3;
`;

const LoginButton = styled.button`
    margin-top: 2rem;
    padding: 1rem 2rem;
    font-size: 1.8rem;
    background-color: #fee500;
    color: #000000;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: transform 0.2s ease;
    opacity: 0;
    transform: translateY(30px);
    animation: slideUp 0.8s ease 0.4s forwards;

    &:hover {
        transform: translateY(-2px);
    }
`;

const handleKakaoLogin = () => {
    const REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY;
    const REDIRECT_URI = process.env.REACT_APP_KAKAO_REDIRECT_URI;

    console.log('REST_API_KEY:', REST_API_KEY);
    console.log('REDIRECT_URI:', REDIRECT_URI);

    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    window.location.href = kakaoURL;
};

const sections = [
    {
        title: '하나님의 말씀을 더 가까이,',
        description: 'BIBLY',
        isBrandSection: true,
        gradient: 'linear-gradient(90deg, rgba(249,137,226,0.8), rgba(30,129,235,0.8), rgba(184,6,218,0.8))',
        background: 'https://source.unsplash.com/random/1920x1080?nature',
        shapes: [
            { top: '20%', left: '10%', delay: '0s' },
            { top: '60%', right: '15%', delay: '2s' },
        ],
    },
    {
        title: '원하는 구절을 다양한 방법으로 찾아보세요',
        description: '주제별, 키워드별, 장절별 검색 지원 및 북마크 저장',
        gradient: 'linear-gradient(90deg, rgba(30,129,235,0.8), rgba(184,6,218,0.8), rgba(249,137,226,0.8))',
        background: 'https://source.unsplash.com/random/1920x1080?technology',
        shapes: [
            { top: '30%', left: '15%', delay: '1s' },
            { top: '50%', right: '10%', delay: '3s' },
        ],
    },
    {
        title: '지금 바로 시작해보세요!',
        isLoginSection: true,
        gradient: 'linear-gradient(90deg, rgba(184,6,218,0.8), rgba(249,137,226,0.8), rgba(30,129,235,0.8))',
        background: 'https://source.unsplash.com/random/1920x1080?business',
        shapes: [
            { top: '25%', left: '20%', delay: '0.5s' },
            { top: '55%', right: '20%', delay: '2.5s' },
        ],
    },
];

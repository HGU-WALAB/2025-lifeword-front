import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getKakaoToken,
    getKakaoUserInfo,
    verifyUser,
    createUser,
    getGoogleToken,
    getGoogleUserInfo,
} from '../services/APIService';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const processLogin = async () => {
            try {
                const url = new URL(window.location.href);
                const code = url.searchParams.get('code');
                console.log('1. 인증 코드 받음:', code);

                if (!code) {
                    throw new Error('No authorization code found');
                }

                let userId, userEmail;
                const isGoogle = url.searchParams.get('scope')?.includes('email');

                if (isGoogle) {
                    console.log('2. 구글 토큰 요청');
                    const tokenData = await getGoogleToken(code);
                    if (!tokenData.access_token) {
                        throw new Error('Failed to get Google access token');
                    }
                    console.log('3. 구글 사용자 정보 요청');
                    const userInfo = await getGoogleUserInfo(tokenData.access_token);
                    userId = `google_${userInfo.id}`;
                    userEmail = userInfo.email;
                } else {
                    console.log('2. 카카오 토큰 요청');
                    const tokenData = await getKakaoToken(code);
                    if (!tokenData.access_token) {
                        throw new Error('Failed to get Kakao access token');
                    }
                    console.log('3. 카카오 사용자 정보 요청');
                    const userInfo = await getKakaoUserInfo(tokenData.access_token);
                    userId = `kakao_${userInfo.id}`;
                    userEmail = userInfo.kakao_account?.email;
                }

                console.log('4. 사용자 확인');
                const verifyResult = await verifyUser(userId);

                if (!verifyResult.response_object.exists) {
                    console.log('5. 새 사용자 등록');
                    await createUser(userId);
                }

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('kakaoUID', userId);
                localStorage.setItem('userEmail', userEmail);
                console.log('6. 로그인 완료');

                navigate('/', { replace: true });
            } catch (error) {
                console.error('Login process failed:', error);
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('kakaoUID');
                localStorage.removeItem('userEmail');
                navigate('/onboarding', { replace: true });
            }
        };

        processLogin();
    }, [navigate]);

    return <div>로그인 처리중...</div>;
};

export default AuthCallback;

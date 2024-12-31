import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getKakaoToken, getKakaoUserInfo, verifyUser, createUser } from '../services/APIService';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const processLogin = async () => {
            try {
                const code = new URL(window.location.href).searchParams.get('code');
                console.log('1. 인증 코드 받음:', code);
                if (!code) {
                    throw new Error('No authorization code found');
                }

                // 1. 카카오 토큰 받기
                const tokenData = await getKakaoToken(code);
                console.log('2. 카카오 토큰 받음:', tokenData);
                if (!tokenData || !tokenData.access_token) {
                    throw new Error('Failed to get access token');
                }

                // 2. 카카오 사용자 정보 가져오기
                const userInfo = await getKakaoUserInfo(tokenData.access_token);
                console.log('3. 카카오 사용자 정보:', userInfo);
                if (!userInfo || !userInfo.id) {
                    throw new Error('Failed to get user info');
                }

                // 3. 사용자 확인
                const verifyResult = await verifyUser(userInfo.id);
                console.log('4. 사용자 확인 결과:', verifyResult);

                if (!verifyResult.response_object.exists) {
                    // 4. 새 사용자 등록
                    const newUser = await createUser(userInfo.id);
                    console.log('5. 새 사용자 등록:', newUser);
                }

                // 5. 로그인 상태 저장
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('kakaoUID', userInfo.id);
                console.log('6. 로그인 상태 저장 완료');

                navigate('/', { replace: true });
            } catch (error) {
                console.error('Login process failed:', error);
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('kakaoUID');
                navigate('/onboarding', { replace: true });
            }
        };

        processLogin();
    }, [navigate]);

    return <div>로그인 처리중...</div>;
};

export default AuthCallback;

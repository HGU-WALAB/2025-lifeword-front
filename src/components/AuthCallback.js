import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getKakaoToken, getKakaoUserInfo, verifyUser, getGoogleToken, getGoogleUserInfo } from '../services/APIService';

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

                let userId, userEmail, uid;
                const isGoogle = url.searchParams.get('scope')?.includes('email');

                if (isGoogle) {
                    console.log('2. 구글 토큰 요청');
                    const tokenData = await getGoogleToken(code);
                    console.log('구글 토큰 응답:', tokenData);
                    if (!tokenData.access_token) {
                        throw new Error('Failed to get Google access token');
                    }
                    console.log('3. 구글 사용자 정보 요청');
                    const userInfo = await getGoogleUserInfo(tokenData.access_token);
                    console.log('구글 사용자 정보:', userInfo);
                    uid = userInfo.id;
                    userId = `google_${uid}`;
                    userEmail = userInfo.email;
                } else {
                    console.log('2. 카카오 토큰 요청');
                    const tokenData = await getKakaoToken(code);
                    console.log('카카오 토큰 응답:', tokenData);
                    if (!tokenData.access_token) {
                        throw new Error('Failed to get Kakao access token');
                    }
                    console.log('3. 카카오 사용자 정보 요청');
                    const userInfo = await getKakaoUserInfo(tokenData.access_token);
                    console.log('카카오 사용자 정보:', userInfo);
                    uid = userInfo.id;
                    userId = `kakao_${uid}`;
                    userEmail = userInfo.kakao_account?.email;
                }

                console.log('4. 사용자 확인 시작');
                console.log('verify 요청 uid:', uid);
                const verifyResult = await verifyUser(uid);
                console.log('verify 응답:', verifyResult);

                if (!verifyResult.data.exists) {
                    console.log('5. 신규 사용자 - 회원가입으로 이동');
                    navigate('/signup', {
                        state: {
                            userId: userId,
                            userEmail: userEmail,
                        },
                        replace: true,
                    });
                    return;
                }

                console.log('5. 기존 사용자 - 로그인 진행');
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('UID', verifyResult.data.userId);
                localStorage.setItem('userEmail', userEmail);
                console.log('6. 로그인 완료 - /main으로 이동');

                navigate('/main', { replace: true });
            } catch (error) {
                console.error('Login process failed:', error);
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('UID');
                localStorage.removeItem('userEmail');
                navigate('/', { replace: true });
            }
        };

        processLogin();
    }, [navigate]);

    return <div>로그인 처리중...</div>;
};

export default AuthCallback;

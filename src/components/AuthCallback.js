import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
    const navigate = useNavigate();

    const getKakaoUserInfo = async (access_token) => {
        try {
            const response = await fetch('https://kapi.kakao.com/v2/user/me', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });
            const data = await response.json();
            console.log('Kakao User Info:', data);
            return data;
        } catch (error) {
            console.error('Error fetching user info:', error);
            return null;
        }
    };

    const getKakaoToken = async (code) => {
        try {
            const response = await fetch('https://kauth.kakao.com/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: process.env.REACT_APP_KAKAO_REST_API_KEY,
                    redirect_uri: process.env.REACT_APP_KAKAO_REDIRECT_URI,
                    code: code,
                }),
            });
            const data = await response.json();
            console.log('Kakao Token:', data);
            return data;
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    };

    useEffect(() => {
        if (localStorage.getItem('isLoggedIn') === 'true') {
            console.log('Already logged in, skipping auth check');
            return;
        }

        const code = new URL(window.location.href).searchParams.get('code');
        console.log('Authorization Code:', code);

        if (code) {
            const processLogin = async () => {
                try {
                    // 1. 액세스 토큰 받기
                    const tokenData = await getKakaoToken(code);
                    if (!tokenData || !tokenData.access_token) {
                        throw new Error('Failed to get access token');
                    }

                    // 2. 사용자 정보 가져오기
                    const userInfo = await getKakaoUserInfo(tokenData.access_token);
                    if (userInfo) {
                        console.log('Kakao UID:', userInfo.id);
                        localStorage.setItem('kakaoUID', userInfo.id);
                    }

                    localStorage.setItem('isLoggedIn', 'true');
                    console.log('Login successful');
                    navigate('/', { replace: true });
                } catch (error) {
                    console.error('Login process failed:', error);
                    localStorage.removeItem('isLoggedIn');
                    navigate('/onboarding', { replace: true });
                }
            };

            processLogin();
        } else if (!localStorage.getItem('isLoggedIn')) {
            console.log('No authorization code found and not logged in');
            localStorage.removeItem('isLoggedIn');
            navigate('/onboarding', { replace: true });
        }
    }, [navigate]);

    return <div>Processing login...</div>;
};

export default AuthCallback;

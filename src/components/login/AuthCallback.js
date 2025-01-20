import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getKakaoToken,
    getKakaoUserInfo,
    verifyUser,
    getGoogleToken,
    getGoogleUserInfo,
} from '../../services/APIService';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const processLogin = async () => {
            try {
                const url = new URL(window.location.href);
                const code = url.searchParams.get('code');

                if (!code) {
                    throw new Error('No authorization code found');
                }

                let userId, userEmail, uid;
                const isGoogle = url.searchParams.get('scope')?.includes('email');

                if (isGoogle) {
                    const tokenData = await getGoogleToken(code);
                    if (!tokenData.access_token) {
                        throw new Error('Failed to get Google access token');
                    }
                    const userInfo = await getGoogleUserInfo(tokenData.access_token);
                    uid = userInfo.id;
                    userId = `google_${uid}`;
                    userEmail = userInfo.email;
                } else {
                    const tokenData = await getKakaoToken(code);
                    if (!tokenData.access_token) {
                        throw new Error('Failed to get Kakao access token');
                    }
                    const userInfo = await getKakaoUserInfo(tokenData.access_token);
                    uid = userInfo.id;
                    userId = `kakao_${uid}`;
                    userEmail = userInfo.kakao_account?.email;
                }

                const verifyResult = await verifyUser(uid);

                if (!verifyResult.success || verifyResult.data === null) {
                    navigate('/signup', {
                        state: {
                            userId: userId,
                            userEmail: userEmail,
                        },
                        replace: true,
                    });
                    return;
                }

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('UID', verifyResult.data.userId);
                localStorage.setItem('userEmail', userEmail);
                localStorage.setItem('job', verifyResult.data.job);
                localStorage.setItem('admin', verifyResult.data.admin);

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

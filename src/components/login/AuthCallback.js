import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getKakaoToken,
    getKakaoUserInfo,
    verifyUser,
    getGoogleToken,
    getGoogleUserInfo,
} from '../../services/APIService';
import { useSetUserState } from '../../recoil/utils';

const AuthCallback = () => {
    const navigate = useNavigate();
    const setUserState = useSetUserState();

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

                const verifyResult = await verifyUser(uid, setUserState);

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

                setUserState({
                    isLoggedIn: 'true',
                    userId: verifyResult.data.userId,
                    userEmail: userEmail,
                    job: verifyResult.data.job,
                    admin: verifyResult.data.admin,
                });

                navigate('/main', { replace: true });
            } catch (error) {
                console.error('Login process failed:', error);
                setUserState({
                    isLoggedIn: 'false',
                    userId: '',
                    userEmail: '',
                    job: '',
                    admin: 'false',
                });
                navigate('/', { replace: true });
            }
        };

        processLogin();
    }, [navigate, setUserState]);

    return <div>로그인 처리중...</div>;
};

export default AuthCallback;

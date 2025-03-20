import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getKakaoToken,
    getKakaoUserInfo,
    verifyUser,
    getGoogleToken,
    getGoogleUserInfo,
    updateUserProvider,
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

                let userEmail, uid, provider;
                const isGoogle = url.searchParams.get('scope')?.includes('email');

                if (isGoogle) {
                    const tokenData = await getGoogleToken(code);
                    if (!tokenData.access_token) {
                        throw new Error('Failed to get Google access token');
                    }
                    const userInfo = await getGoogleUserInfo(tokenData.access_token);
                    uid = userInfo.id;
                    userEmail = userInfo.email;
                    provider = 'google';
                } else {
                    const tokenData = await getKakaoToken(code);
                    if (!tokenData.access_token) {
                        throw new Error('Failed to get Kakao access token');
                    }
                    const userInfo = await getKakaoUserInfo(tokenData.access_token);
                    uid = userInfo.id;
                    userEmail = userInfo.kakao_account?.email;
                    provider = 'kakao';
                }

                const verifyResult = await verifyUser(userEmail, setUserState);

                if (!verifyResult.success || verifyResult.data === null) {
                    navigate('/signup', {
                        state: {
                            userId: `${provider}_${uid}`,
                            userEmail: userEmail,
                        },
                        replace: true,
                    });
                    return;
                }

                await updateUserProvider(userEmail, provider, uid);

                setUserState({
                    isLoggedIn: true,
                    userId: verifyResult.data.userId,
                    userEmail: userEmail,
                    job: verifyResult.data.job,
                    admin: verifyResult.data.admin,
                });

                navigate('/main', { replace: true });
            } catch (error) {
                console.error('Login process failed:', error);
                setUserState({
                    isLoggedIn: false,
                    userId: '',
                    userEmail: '',
                    job: '',
                    admin: false,
                });
                navigate('/', { replace: true });
            }
        };

        processLogin();
    }, [navigate, setUserState]);

    return <div>로그인 처리중...</div>;
};

export default AuthCallback;

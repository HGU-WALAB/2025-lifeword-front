import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateKakaoUser, authenticateGoogleUser } from '../../services/APIService';
import { useSetUserState } from '../../recoil/utils';

const AuthCallback = () => {
    const navigate = useNavigate();
    const setUserState = useSetUserState();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const provider = urlParams.get('state');

        if (code) {
            const authFunction = provider === 'kakao' ? authenticateKakaoUser : authenticateGoogleUser;

            authFunction(code)
                .then((data) => {
                    if (data.exists) {
                        document.cookie = `jwt=${data.token}; path=/; SameSite=None; Secure`;

                        setUserState({
                            isLoggedIn: true,
                            userId: data.userId,
                            userEmail: data.email,
                            job: data.job,
                            role: data.role,
                        });

                        navigate('/main', { replace: true });
                    } else {
                        navigate('/signup', {
                            state: {
                                userId: data.userId,
                                userEmail: data.email,
                                provider: provider,
                            },
                        });
                    }
                })
                .catch((error) => {
                    if (error.message.includes('찾을 수 없음')) {
                        navigate('/signup', {
                            state: { provider: provider },
                        });
                    } else {
                        navigate('/', { replace: true });
                    }
                });
        }
    }, [navigate, setUserState]);

    return <div>로그인 처리 중...</div>;
};

export default AuthCallback;

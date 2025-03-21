import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateKakaoUser, authenticateGoogleUser } from '../../services/APIService';
import { useSetUserState } from '../../recoil/utils';

const AuthCallback = () => {
    const navigate = useNavigate();
    const setUserState = useSetUserState();
    //  중복 요청 방지
    const hasFetched = useRef(false);

    useEffect(() => {
        //  이미 요청했으면 실행 안 함
        if (hasFetched.current) return;
        //  요청 플래그 설정
        hasFetched.current = true;

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const provider = urlParams.get('state');

        // code가 없으면 실행 X
        if (!code) return;

        const authFunction = provider === 'kakao' ? authenticateKakaoUser : authenticateGoogleUser;

        authFunction(code)
            .then((data) => {
                if (data.exists) {
                    setUserState({
                        isLoggedIn: true,
                        userId: data.userId,
                        userName: data.name,
                        userEmail: data.email,
                        job: data.job,
                        role: data.role,
                        admin: data.role === 'ADMIN',
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
    }, [navigate, setUserState]);

    return <div>로그인 처리 중...</div>;
};

export default AuthCallback;

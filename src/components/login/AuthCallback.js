import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateGoogleUser } from '../../services/APIService';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        console.log("✅ 받은 Google Authorization Code:", code); // 로그 추가

        if (code) {
            authenticateGoogleUser(code)
                .then((data) => {
                    console.log("✅ Google 로그인 성공!", data);
                    console.log("✅ Access Token:", data.access_token);
                    console.log("✅ User Info:", data.user);
                    navigate('/main', { replace: true });
                })
                .catch((error) => {
                    console.error("❌ Google 로그인 실패", error);
                    navigate('/', { replace: true });
                });
        }
    }, [navigate]);

    return <div>Google 로그인 중...</div>;
};

export default AuthCallback;

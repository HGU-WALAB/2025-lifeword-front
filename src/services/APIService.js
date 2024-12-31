const BASE_URL = 'http://walab.handong.edu:8080/eax9952_1/api/v1';

// User 관련 API
export const verifyUser = async (kakaoUid) => {
    try {
        const response = await fetch(`${BASE_URL}/users/verify?kakaoUid=${kakaoUid}`);
        return await response.json();
    } catch (error) {
        console.error('Error verifying user:', error);
        throw error;
    }
};

export const createUser = async (kakaoUid) => {
    try {
        const response = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ kakaoUid }),
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

// Bookmark 관련 API
export const createBookmark = async (kakaoUid, verseId) => {
    try {
        const response = await fetch(`${BASE_URL}/bookmarks?kakaoUid=${kakaoUid}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ verseId }),
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating bookmark:', error);
        throw error;
    }
};

export const getBookmarks = async (kakaoUid) => {
    try {
        const response = await fetch(`${BASE_URL}/bookmarks?kakaoUid=${kakaoUid}`);
        return await response.json();
    } catch (error) {
        console.error('Error getting bookmarks:', error);
        throw error;
    }
};

export const deleteBookmark = async (kakaoUID, verseId) => {
    try {
        const response = await fetch(`${BASE_URL}/bookmarks/${verseId}?kakaoUid=${kakaoUID}`, {
            method: 'DELETE',
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error deleting bookmark:', error);
        throw error;
    }
};

// Bible 관련 API
export const getBooks = async (testament) => {
    try {
        const response = await fetch(`${BASE_URL}/books?testament=${testament}`);
        return await response.json();
    } catch (error) {
        console.error('Error getting books:', error);
        throw error;
    }
};

export const getBibles = async (testament, book, chapter) => {
    try {
        let url = `${BASE_URL}/bibles?testament=${testament}`;
        if (book) url += `&book=${book}`;
        if (chapter) url += `&chapter=${chapter}`;

        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error getting bibles:', error);
        throw error;
    }
};

export const searchBibles = async (mode, keyword1, keyword2 = null, operator = null) => {
    try {
        let url = `${BASE_URL}/bibles/search?mode=${mode}&keyword1=${encodeURIComponent(keyword1)}`;
        if (keyword2) url += `&keyword2=${encodeURIComponent(keyword2)}`;
        if (operator) url += `&operator=${operator}`;

        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error searching bibles:', error);
        throw error;
    }
};

// 카카오 로그인 관련
export const getKakaoToken = async (code) => {
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
        return await response.json();
    } catch (error) {
        console.error('Error getting Kakao token:', error);
        throw error;
    }
};

export const getKakaoUserInfo = async (access_token) => {
    try {
        const response = await fetch('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        return await response.json();
    } catch (error) {
        console.error('Error getting Kakao user info:', error);
        throw error;
    }
};

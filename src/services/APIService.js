const BASE_URL = 'http://walab.handong.edu:8080/naimkim_1/api/v1';

// User 관련 API
export const verifyUser = async (oauthUid) => {
    try {
        const response = await fetch(`${BASE_URL}/users/verify/kakao-google?oauthUid=${oauthUid}`);
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('job', data.data.job);
            localStorage.setItem('admin', data.data.admin);
        }
        return data;
    } catch (error) {
        console.error('Error verifying user:', error);
        throw error;
    }
};

export const login = async (email, password) => {
    try {
        const response = await fetch(
            `${BASE_URL}/users/verify/bibly?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        );
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('job', data.data.job);
            localStorage.setItem('admin', data.data.admin);
        }
        return data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const response = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const verifyEmail = async (email) => {
    try {
        const response = await fetch(`${BASE_URL}/users/verify/bibly-emailCheck?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        return {
            success: true,
            data: data,
        };
    } catch (error) {
        console.error('Error verifying email:', error);
        throw error;
    }
};

// Bookmark 관련 API
export const createBookmark = async (userID, verseId) => {
    try {
        const response = await fetch(`${BASE_URL}/bookmarks?userID=${userID}`, {
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

export const getBookmarks = async (userID) => {
    try {
        const response = await fetch(`${BASE_URL}/bookmarks?userID=${userID}`);
        return await response.json();
    } catch (error) {
        console.error('Error getting bookmarks:', error);
        throw error;
    }
};

export const deleteBookmark = async (userID, verseId) => {
    try {
        const response = await fetch(`${BASE_URL}/bookmarks/${verseId}?userID=${userID}`, {
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

export const searchBibles = async (keyword) => {
    try {
        const response = await fetch(`${BASE_URL}/bibles/search?keyword1=${encodeURIComponent(keyword)}`);
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

// 구글 로그인 관련
export const getGoogleToken = async (code) => {
    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.REACT_APP_GOOGLE_REDIRECT_URI,
                grant_type: 'authorization_code',
            }),
        });
        return await response.json();
    } catch (error) {
        console.error('Error getting Google token:', error);
        throw error;
    }
};

export const getGoogleUserInfo = async (access_token) => {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        return await response.json();
    } catch (error) {
        console.error('Error getting Google user info:', error);
        throw error;
    }
};

// 설교 관련 API
export const createSermon = async (sermonData) => {
    try {
        const response = await fetch(`${BASE_URL}/sermons`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sermonData),
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating sermon:', error);
        throw error;
    }
};

export const getPublicSermons = async () => {
    try {
        const response = await fetch(`${BASE_URL}/sermons/publiclist`);
        return await response.json();
    } catch (error) {
        console.error('Error getting public sermons:', error);
        throw error;
    }
};

export const getUserSermons = async (userId, option = 'all') => {
    try {
        const response = await fetch(`${BASE_URL}/sermons/user/list?userId=${userId}&option=${option}`);
        return await response.json();
    } catch (error) {
        console.error('Error getting user sermons:', error);
        throw error;
    }
};

export const updateSermon = async (sermonId, userId, sermonData) => {
    try {
        const response = await fetch(`${BASE_URL}/sermons/${sermonId}?userId=${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sermonData),
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating sermon:', error);
        throw error;
    }
};

export const deleteSermon = async (sermonId, userId) => {
    try {
        const response = await fetch(`${BASE_URL}/sermons/${sermonId}?userId=${userId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete sermon');
        }

        // 응답이 비어있을 수 있으므로 조건부로 JSON 파싱
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    } catch (error) {
        console.error('Error deleting sermon:', error);
        throw error;
    }
};

export const getSermonDetail = async (sermonId) => {
    try {
        const response = await fetch(`${BASE_URL}/sermons/details/${sermonId}`);
        return await response.json();
    } catch (error) {
        console.error('Error getting sermon detail:', error);
        throw error;
    }
};

export const searchSermons = async (keyword, userId, searchIn = 'both') => {
    try {
        const response = await fetch(
            `${BASE_URL}/sermons/search?keyword=${encodeURIComponent(keyword)}&userId=${userId}&searchIn=${searchIn}`
        );
        return await response.json();
    } catch (error) {
        console.error('Error searching sermons:', error);
        throw error;
    }
};

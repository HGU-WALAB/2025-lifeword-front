import axios from 'axios';

const BASE_URL = 'http://walab.handong.edu:8080/naimkim_1/api/v1';


// User 관련 API
export const verifyUser = async (email, setUserState) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/users/verify/kakao-google`, {
            params: { email },
        });
        if (data.success && setUserState) {
            setUserState({
                userId: data.data.userId,
                userEmail: data.data.email,
                job: data.data.job,
                admin: data.data.admin,
                isLoggedIn: true,
            });
        }
        return data;
    } catch (error) {
        console.error('Error verifying user:', error);
        throw error;
    }
};

export const login = async (email, password, setUserState) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/users/verify/bibly`, {
            params: { email, password },
        });
        if (data.success && setUserState) {
            setUserState({
                userId: data.data.userId,
                userEmail: email,
                job: data.data.job,
                admin: data.data.admin,
                isLoggedIn: true,
            });
        }
        return data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const { data } = await axios.post(`${BASE_URL}/users`, userData);
        return data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const verifyEmail = async (email) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/users/verify/emailCheck`, {
            params: { email },
        });
        return {
            success: true,
            data: data,
        };
    } catch (error) {
        console.error('Error verifying email:', error);
        throw error;
    }
};

// Sermon 관련 API
export const createSermon = async (sermonData) => {
    try {
        const { data } = await axios.post(`${BASE_URL}/sermons`, sermonData);
        return data;
    } catch (error) {
        console.error('Error creating sermon:', error);
        throw error;
    }
};

export const getPublicSermons = async () => {
    try {
        const { data } = await axios.get(`${BASE_URL}/sermons/publiclist`);
        return data;
    } catch (error) {
        console.error('Error getting public sermons:', error);
        throw error;
    }
};

export const getUserSermons = async (userId, option = 'all') => {
    try {
        const { data } = await axios.get(`${BASE_URL}/sermons/user/list`, {
            params: { userId, option },
        });
        return data;
    } catch (error) {
        console.error('Error getting user sermons:', error);
        throw error;
    }
};

export const updateSermon = async (sermonId, userId, sermonData) => {
    try {
        const { data } = await axios.patch(`${BASE_URL}/sermons/update/${sermonId}`, sermonData, {
            params: { userId },
        });
        return data;
    } catch (error) {
        console.error('Error updating sermon:', error);
        throw error;
    }
};

export const deleteSermon = async (sermonId, userId) => {
    try {
        const { data } = await axios.delete(`${BASE_URL}/sermons/${sermonId}`, {
            params: { userId },
        });
        return data || { success: true };
    } catch (error) {
        console.error('Error deleting sermon:', error);
        throw error;
    }
};

export const getSermonDetail = async (sermonId) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/sermons/details/${sermonId}`);
        return data;
    } catch (error) {
        console.error('Error getting sermon detail:', error);
        throw error;
    }
};

export const searchSermons = async (keyword, userId, searchIn = 'both') => {
    try {
        const { data } = await axios.get(`${BASE_URL}/sermons/search`, {
            params: { keyword, userId, searchIn },
        });
        return data;
    } catch (error) {
        console.error('Error searching sermons:', error);
        throw error;
    }
};

// Bookmark 관련 API
export const createBookmark = async (userID, verseId) => {
    try {
        const { data } = await axios.post(
            `${BASE_URL}/bookmarks`,
            { verseId },
            {
                params: { userID },
            }
        );
        return data;
    } catch (error) {
        console.error('Error creating bookmark:', error);
        throw error;
    }
};

export const getBookmarks = async (userID) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/bookmarks`, {
            params: { userID },
        });
        return data;
    } catch (error) {
        console.error('Error getting bookmarks:', error);
        throw error;
    }
};

export const deleteBookmark = async (userID, verseId) => {
    try {
        const { data } = await axios.delete(`${BASE_URL}/bookmarks/${verseId}`, {
            params: { userID },
        });
        return data;
    } catch (error) {
        console.error('Error deleting bookmark:', error);
        throw error;
    }
};

// Bible 관련 API
export const getBooks = async (testament) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/books`, {
            params: { testament },
        });
        return data;
    } catch (error) {
        console.error('Error getting books:', error);
        throw error;
    }
};

export const getBibles = async (testament, book, chapter) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/bibles`, {
            params: { testament, ...(book && { book }), ...(chapter && { chapter }) },
        });
        return data;
    } catch (error) {
        console.error('Error getting bibles:', error);
        throw error;
    }
};

export const searchBibles = async (keyword) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/bibles/search`, {
            params: { keyword1: keyword },
        });
        return data;
    } catch (error) {
        console.error('Error searching bibles:', error);
        throw error;
    }
};

// 카카오 로그인 관련
export const getKakaoToken = async (code) => {
    try {
        const { data } = await axios.post('https://kauth.kakao.com/oauth/token', null, {
            params: {
                grant_type: 'authorization_code',
                client_id: process.env.REACT_APP_KAKAO_REST_API_KEY,
                redirect_uri: process.env.REACT_APP_KAKAO_REDIRECT_URI,
                code: code,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
        });
        return data;
    } catch (error) {
        console.error('Error getting Kakao token:', error);
        throw error;
    }
};

export const getKakaoUserInfo = async (access_token) => {
    try {
        const { data } = await axios.get('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        return data;
    } catch (error) {
        console.error('Error getting Kakao user info:', error);
        throw error;
    }
};

// 구글 로그인 관련
export const getGoogleToken = async (code) => {
    try {
        const { data } = await axios.post('https://oauth2.googleapis.com/token', null, {
            params: {
                code,
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.REACT_APP_GOOGLE_REDIRECT_URI,
                grant_type: 'authorization_code',
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return data;
    } catch (error) {
        console.error('Error getting Google token:', error);
        throw error;
    }
};

export const getGoogleUserInfo = async (access_token) => {
    try {
        const { data } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        return data;
    } catch (error) {
        console.error('Error getting Google user info:', error);
        throw error;
    }
};

// 관리자 관련 API
export const getAdminUsers = async () => {
    try {
        const { data } = await axios.get(`${BASE_URL}/admin/users`);
        return data;
    } catch (error) {
        console.error('Error getting admin users:', error);
        throw error;
    }
};

export const searchAdminUsers = async (type, value) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/admin/users/search`, {
            params: { type, value },
        });
        return data;
    } catch (error) {
        console.error('Error searching admin users:', error);
        throw error;
    }
};

export const updateAdminUser = async (userId, userData) => {
    try {
        const { data } = await axios.patch(`${BASE_URL}/admin/users/${userId}`, userData);
        return data;
    } catch (error) {
        console.error('Error updating admin user:', error);
        throw error;
    }
};

export const deleteAdminUser = async (userId) => {
    try {
        const { data } = await axios.delete(`${BASE_URL}/admin/users/${userId}`);
        return data || { success: true };
    } catch (error) {
        console.error('Error deleting admin user:', error);
        throw error;
    }
};

export const getAdminSermons = async () => {
    try {
        const { data } = await axios.get(`${BASE_URL}/sermons/admin/list`);
        return data;
    } catch (error) {
        console.error('Error getting admin sermons:', error);
        throw error;
    }
};

export const updateUserProvider = async (email, provider, uid) => {
    try {
        const { data } = await axios.patch(`${BASE_URL}/users/provider`, null, {
            params: {
                email,
                oauthProvider: provider,
                oauthUid: uid,
            },
        });
        return data;
    } catch (error) {
        console.error('Error updating user provider:', error);
        throw error;
    }
};

export const setUserPassword = async (email, password) => {
    try {
        const { data } = await axios.patch(`${BASE_URL}/users/setUserPassword`, null, {
            params: { email, password },
        });
        return data;
    } catch (error) {
        console.error('Error setting user password:', error);
        throw error;
    }
};

import axios from 'axios';

const BASE_UR1L = 'http://walab.handong.edu:8080/naimkim_1/api/v1';
const BASE_URL = 'http://localhost:8080/api/v1';
const BASE_URL2='http://localhost:8080/auth';
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

export const createUser = async ({ email, name, oauthProvider }) => {
    try {
        const { data } = await axios.post(`${BASE_URL}/users`, {
            email,
            name,
            oauthProvider
        });
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
        const response = await axios.get(`${BASE_URL}/sermons/publiclist`);
        return response.data;
    } catch (error) {
        console.error('Error fetching public sermons:', error);
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

export const searchSermons = async (keyword) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/sermons/search`, {
            params: { keyword },
        });
        return data;
    } catch (error) {
        console.error('Error searching sermons:', error);
        throw error;
    }
};

// 필터링 API
export const getFilteredSermons = async (filters) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/sermons/filtered-list`, {
            params: {
                sort: filters.sort || 'desc',
                worshipType: filters.worshipTypes?.length === 0 ? 'all' : filters.worshipTypes.join(','),
                startDate:
                    filters.dateFilter?.type === 'single'
                        ? filters.dateFilter.date
                        : filters.dateFilter?.range?.startDate || '',
                endDate:
                    filters.dateFilter?.type === 'single'
                        ? filters.dateFilter.date
                        : filters.dateFilter?.range?.endDate || '',
                scripture: filters.bibleBooks?.length === 0 ? '' : filters.bibleBooks.join(','),
            },
        });
        return data;
    } catch (error) {
        console.error('Error fetching filtered sermons:', error);
        throw error;
    }
};

// Bookmark 관련 API
export const createBookmark = async (userID, verseId , sermonId , isSermon) => {
    try {
        const { data } = await axios.post(
            `${BASE_URL}/bookmarks`,
            { verseId, sermonId,isSermon },
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

export const getSermonBookmarks = async (userID) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/bookmarks/sermon`, {
            params: { userID },
        });
        return data;
    } catch (error) {
        console.error('Error getting bookmarks:', error);
        throw error;
    }
};

export const getVerseBookmarks = async (userID) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/bookmarks/verse`, {
            params: { userID },
        });
        return data;
    } catch (error) {
        console.error('Error getting bookmarks:', error);
        throw error;
    }
};

export const deleteBookmark = async (userID, bookmarkId) => {
    //console.log(bookmarkId.bookmarkId);
    try {
        const { data } = await axios.delete(`${BASE_URL}/bookmarks/${parseInt(bookmarkId)}`, {
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
// 백엔드로 OAuth 로그인 요청
export const loginWithKakao = async (code) => {
    try {
        const { data } = await axios.post(`${BASE_URL}/auth/login/kakao`, { code }, { withCredentials: true });
        return data;
    } catch (error) {
        console.error('Error logging in with Kakao:', error);
        throw error;
    }
};

export const loginWithGoogle = async () => {
    try {
        // Google OAuth 인증 URL 생성
        const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile`;

        // 사용자가 Google 로그인 버튼을 클릭하면 이 URL로 리디렉트
        window.location.href = GOOGLE_AUTH_URL;
    } catch (error) {
        console.error('Google 로그인 오류:', error);
        throw error;
    }
};

export const authenticateGoogleUser = async (code) => {
    try {
        const response = await axios.post(`${BASE_URL2}/login/google`, { code });
        console.log("✅ Google 로그인 성공!", response.data);

        return response.data;
    } catch (error) {
        console.error("❌ Google 로그인 실패:", error);
        throw error;
    }
};
// 📌 카카오 로그인 후 백엔드로 코드 전달
export const authenticateKakaoUser = async (code) => {
    try {
        const response = await fetch("http://localhost:8080/auth/login/kakao", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
            credentials: "include", // ✅ 세션 유지
        });

        const data = await response.json();
        console.log("✅ 카카오 로그인 성공! 받은 데이터:", data);
        return data;
    } catch (error) {
        console.error("❌ 카카오 로그인 실패:", error);
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

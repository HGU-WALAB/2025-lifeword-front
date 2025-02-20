import axios from 'axios';

//const BASE_URL = 'http://172.18.130.17:8080';

//const BASE_URL = 'http://192.168.0.7:8080';
const BASE_URL='http://localhost:8080';

const API_PREFIX = '/api/v1';

// axios 인스턴스 생성 및 기본 설정
const axiosInstance = axios.create({
    baseURL: `${BASE_URL}${API_PREFIX}`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    const token = getJwtFromCookie(); // ✅ 쿠키에서 JWT 가져오기
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosInstance;

// auth 관련 요청을 위한 별도 함수
const authRequest = async (endpoint, options) => {
    return fetch(`${BASE_URL}/auth${endpoint}`, {
        ...options,
        credentials: 'include',
    });
};
const getJwtFromCookie = () => {
    const cookies = document.cookie.split('; ');
    const jwtCookie = cookies.find(cookie => cookie.startsWith('jwt='));
    return jwtCookie ? jwtCookie.split('=')[1] : null;
};

// User 관련 API
export const verifyUser = async (email, setUserState) => {
    try {
        const { data } = await axiosInstance.get('/users/verify/kakao-google', {
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
        const { data } = await axiosInstance.get('/users/verify/bibly', {
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
        const { data } = await axiosInstance.post('/users', userData);
        return data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const verifyEmail = async (email) => {
    try {
        const { data } = await axiosInstance.get('/users/verify/emailCheck', {
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
        const { data } = await axiosInstance.post('/sermons', sermonData);
        return data;
    } catch (error) {
        console.error('Error creating sermon:', error);
        throw error;
    }
};

export const updateSermon = async (sermonId, userId, sermonData) => {
    try {
        const { data } = await axiosInstance.patch(`/sermons/update/${sermonId}`, sermonData, {
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
        const { data } = await axiosInstance.delete(`/sermons/${sermonId}`, {
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
        const { data } = await axiosInstance.get(`/sermons/details/${sermonId}`);
        return data;
    } catch (error) {
        console.error('Error getting sermon detail:', error);
        throw error;
    }
};

// Bookmark 관련 API
export const getBookmarks = async (userID) => {
    try {
        const [verseResponse, sermonResponse] = await Promise.all([
            axiosInstance.get('/bookmarks/verse', { params: { userID } }),
            axiosInstance.get('/bookmarks/sermon', { params: { userID } }),
        ]);
        return {
            success: true,
            verses: verseResponse.data.data || [],
            sermons: sermonResponse.data.data || [],
        };
    } catch (error) {
        console.error('Error getting bookmarks:', error);
        throw error;
    }
};

export const createBookmark = async (userID, verseId, sermonId, isSermon) => {
    try {
        const { data } = await axiosInstance.post(
            '/bookmarks',
            { verseId, sermonId, isSermon },
            { params: { userID } }
        );
        return data;
    } catch (error) {
        console.error('Error creating bookmark:', error);
        throw error;
    }
};

export const deleteBookmark = async (userID, bookmarkId) => {
    try {
        const { data } = await axiosInstance.delete(`/bookmarks/${bookmarkId}`, {
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
        const { data } = await axiosInstance.get('/books', {
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
        const { data } = await axiosInstance.get('/bibles', {
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
        const { data } = await axiosInstance.get('/bibles/search', {
            params: { keyword1: keyword },
        });
        return data;
    } catch (error) {
        console.error('Error searching bibles:', error);
        throw error;
    }
};
const setJwtCookie = (token) => {
    const isSecure = window.location.protocol === 'https:'; // ✅ HTTPS 여부 확인
    document.cookie = `jwt=${token}; path=/; ${isSecure ? 'Secure; SameSite=None' : ''}`;
};

// 카카오 로그인
export const authenticateKakaoUser = async (code) => {
    try {
        const response = await authRequest('/login/kakao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ code }),
            mode: 'cors',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`카카오 인증 중 오류 발생: ${errorText}`);
        }

        const data = await response.json();

        // ✅ JWT를 쿠키에 저장
        setJwtCookie(data.token);

        return data;
    } catch (error) {
        console.error('❌ 카카오 로그인 실패:', error);
        throw error;
    }
};

export const getKakaoUserInfo = async (access_token) => {
    try {
        const { data } = await axiosInstance.get('https://kapi.kakao.com/v2/user/me', {
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

// 구글 로그인
export const authenticateGoogleUser = async (code) => {
    try {
        // 기존 세션 쿠키 삭제
        document.cookie = 'JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        const response = await authRequest('/login/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ code }),
            mode: 'cors',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`구글 인증 중 오류 발생: ${errorText}`);
        }

        // 응답 헤더에서 쿠키 확인 (디버깅용)
        console.log('Response headers:', response.headers);
        console.log('Cookies after login:', document.cookie);

        const data = await response.json();
        setJwtCookie(data.token);

        console.log('✅ 구글 로그인 성공! 받은 데이터:', data);
        return data;
    } catch (error) {
        console.error('❌ 구글 로그인 실패:', error);
        throw error;
    }
};

export const getGoogleUserInfo = async (access_token) => {
    try {
        const { data } = await axiosInstance.get('https://www.googleapis.com/oauth2/v2/userinfo', {
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

export const updateUserProvider = async (email, provider, uid) => {
    try {
        const { data } = await axiosInstance.patch('/users/provider', null, {
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
        const { data } = await axiosInstance.patch('/users/setUserPassword', null, {
            params: { email, password },
        });
        return data;
    } catch (error) {
        console.error('Error setting user password:', error);
        throw error;
    }
};

// 관리자 user 관련 API
export const getAdminUsers = async () => {
    try {
        const { data } = await axiosInstance.get('/admin/users');
        return data;
    } catch (error) {
        console.error('Error getting admin users:', error);
        throw error;
    }
};

export const searchAdminUsers = async (type, value) => {
    try {
        const { data } = await axiosInstance.get('/admin/users/search', {
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
        const { data } = await axiosInstance.patch(`/admin/users/${userId}`, userData);
        return data;
    } catch (error) {
        console.error('Error updating admin user:', error);
        throw error;
    }
};

export const deleteAdminUser = async (userId) => {
    try {
        const { data } = await axiosInstance.delete(`/admin/users/${userId}`);
        return data || { success: true };
    } catch (error) {
        console.error('Error deleting admin user:', error);
        throw error;
    }
};

export const getFilteredSermonList = async (params) => {
    try {
        const { data } = await axiosInstance.get('/sermons/filtered-list-user', {
            params: {
                user_id: params.userId,
                keyword: params.keyword || null,
                searchType: params.searchType || null,
                sort: params.sort || 'desc',
                worshipType: params.worshipTypes?.join(',') || '',
                scripture: params.scripture?.join(',') || '',
                page: params.page || 1,
                size: params.size || 10,
                mode: params.mode || 0,
                startDate: params.startDate || '',
                endDate: params.endDate || '',
            },
        });
        return data;
    } catch (error) {
        console.error('Error fetching filtered sermons:', error);
        throw error;
    }
};

export const getFilteredSermonListAdmin = async (params) => {
    try {
        const { data } = await axiosInstance.get('/sermons/filtered-list-admin', {
            params: {
                keyword: params.keyword || null,
                searchType: params.searchType || null,
                sort: params.sort || 'desc',
                worshipType: params.worshipTypes?.join(',') || '',
                scripture: params.scripture?.join(',') || '',
                page: params.page || 1,
                size: params.size || 10,
                startDate: params.startDate || '',
                endDate: params.endDate || '',
            },
        });
        return data;
    } catch (error) {
        console.error('Error fetching filtered sermons:', error);
        throw error;
    }
};

// 관리자용 설교 삭제 API
export const deleteSermonAdmin = async (sermonId, userId) => {
    try {
        const { data } = await axiosInstance.delete(`/sermons/${sermonId}`, {
            params: { userId },
        });
        return data || { success: true };
    } catch (error) {
        console.error('Error deleting sermon:', error);
        throw error;
    }
};

// 관리자용 설교 수정 API
export const updateSermonAdmin = async (sermonId, sermonData) => {
    try {
        const { data } = await axiosInstance.patch(`/admin/sermons/${sermonId}`, sermonData);
        return data;
    } catch (error) {
        console.error('Error updating sermon:', error);
        throw error;
    }
};

// 일반 로그인
export const loginUser = async (email, password) => {
    try {
        const response = await authRequest(`/login?email=${email}&password=${password}`, {
            method: 'POST',
        });
        return await response.json();
    } catch (error) {
        console.error('❌ 로그인 실패:', error);
        throw error;
    }
};

// 로그아웃
export const logout = async () => {
    try {
        await authRequest('/logout', {
            method: 'POST',
        });

        // ✅ 쿠키 만료 처리 개선
        document.cookie = "jwt=; path=/; expires=" + new Date(0).toUTCString();

    } catch (error) {
        console.error('❌ 로그아웃 실패:', error);
        throw error;
    }
};


export const checkAuth = async () => {
    try {
        const response = await fetch(`${BASE_URL}/auth/check`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                accept: '*/*',

            },
        });

        if (!response.ok) {
            throw new Error('Unauthorized');
        }

        return true;
    } catch (error) {
        console.error('Auth check failed:', error);
        return false;
    }
};


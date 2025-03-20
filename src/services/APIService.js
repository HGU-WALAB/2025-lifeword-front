import axios from 'axios';

const BASE_URL = 'https://walab.info:8443/lifeword/api/v1';

// User 관련 API
export const verifyUser = async (email, setUserState) => {
    try {
        // 기존 세션 스토리지 클리어
        sessionStorage.clear();

        const { data } = await axios.get(`${BASE_URL}/users/verify/kakao-google`, {
            params: { email },
        });

        const userStateData = {
            isLoggedIn: true,
            userEmail: email,
            userId: data.data.userId,
            role: data.data.admin ? 'ADMIN' : 'USER',
            job: data.data.job,
        };

        if (data.success && setUserState) {
            setUserState(userStateData);
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
                isLoggedIn: true,
                userId: data.data.userId,
                userEmail: email,
                job: data.data.job,
                role: data.data.admin ? 'ADMIN' : 'USER',
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

export const updateSermon = async (sermonId, userId, sermonData) => {
    try {
        console.log('=== Updating Sermon ===');
        console.log('Sermon ID:', sermonId);
        console.log('User ID:', userId);
        console.log('Update Data:', sermonData);

        // 1. 설교 기본 정보 업데이트
        const { data } = await axios.patch(
            `${BASE_URL}/sermons/update/${sermonId}`,
            {
                userId: userId,
                sermonDate: sermonData.sermonDate,
                worshipType: sermonData.worshipType,
                mainScripture: sermonData.mainScripture,
                additionalScripture: sermonData.additionalScripture,
                sermonTitle: sermonData.sermonTitle,
                summary: sermonData.summary,
                notes: sermonData.notes,
                recordInfo: sermonData.recordInfo || '',
                public: sermonData.public,
            },
            {
                params: { userId },
            }
        );

        // 2. 본문 내용 업데이트
        if (data.contentTextId && sermonData.contents?.[0]?.contentText) {
            await updateText(
                data.contentTextId,
                userId,
                sermonData.sermonTitle, // textTitle로 설교 제목 사용
                false, // isDraft는 false
                sermonData.contents[0].contentText
            );
        }

        return data;
    } catch (error) {
        console.error('Error updating sermon:', error);
        throw error;
    }
};

export const deleteSermon = async (sermonId, userId) => {
    try {
        const response = await axios.delete(`${BASE_URL}/sermons/${sermonId}?userId=${userId}`);
        return response.data;
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

// Bookmark 관련 API
export const getBookmarks = async (userID) => {
    try {
        const [verseResponse, sermonResponse] = await Promise.all([
            axios.get(`${BASE_URL}/bookmarks/verse`, { params: { userID } }),
            axios.get(`${BASE_URL}/bookmarks/sermon`, { params: { userID } }),
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
        const { data } = await axios.post(
            `${BASE_URL}/bookmarks`,
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
        const { data } = await axios.delete(`${BASE_URL}/bookmarks/${bookmarkId}`, {
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

// 관리자 user 관련 API
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

export const getFilteredSermonList = async (params) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/sermons/filtered-list-user`, {
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
        const { data } = await axios.get(`${BASE_URL}/sermons/filtered-list-admin`, {
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
        const response = await axios.delete(`${BASE_URL}/sermons/${sermonId}?userId=${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting sermon:', error);
        throw error;
    }
};

// 관리자용 설교 수정 API
export const updateSermonAdmin = async (sermonId, sermonData) => {
    try {
        const { data } = await axios.patch(`${BASE_URL}/admin/sermons/${sermonId}`, sermonData);
        return data;
    } catch (error) {
        console.error('Error updating sermon:', error);
        throw error;
    }
};

// Text 관련 API
export const createText = async (sermonId, userId, isDraft, textTitle, textContent) => {
    try {
        const { data } = await axios.post(
            `${BASE_URL}/text/create`,
            { textContent },
            {
                params: {
                    sermonId,
                    userId,
                    isDraft,
                    textTitle,
                },
            }
        );
        return data;
    } catch (error) {
        console.error('Error creating text:', error);
        throw error;
    }
};

export const updateText = async (textId, userId, textTitle, isDraft, textContent) => {
    try {
        const { data } = await axios.patch(
            `${BASE_URL}/text/update/${textId}`,
            { textContent },
            {
                params: {
                    userId,
                    textTitle,
                    isDraft,
                },
            }
        );
        return data;
    } catch (error) {
        console.error('Error updating text:', error);
        throw error;
    }
};

export const getTextList = async (sermonId, userId) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/text/list/${sermonId}`, {
            params: { userId },
        });
        return data;
    } catch (error) {
        console.error('Error getting text list:', error);
        throw error;
    }
};

export const getTextDetail = async (sermonId, textId, userId) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/text/${sermonId}/${textId}`, {
            params: { userId },
        });
        return data;
    } catch (error) {
        console.error('Error getting text detail:', error);
        throw error;
    }
};

export const deleteText = async (textId, userId) => {
    try {
        const { data } = await axios.delete(`${BASE_URL}/text/delete/${textId}`, {
            params: { userId },
        });
        return data;
    } catch (error) {
        console.error('Error deleting text:', error);
        throw error;
    }
};

// 본문 내용 업데이트 함수 추가
export const updateSermonText = async (sermonId, textId, userId, content) => {
    try {
        console.log('=== Updating Sermon Text ===');
        console.log('Text ID:', textId);
        console.log('Content:', content);

        const { data } = await axios.patch(
            `${BASE_URL}/sermons/${sermonId}/texts/${textId}`,
            {
                textContent: content,
                userId: userId,
            },
            {
                params: { userId },
            }
        );
        return data;
    } catch (error) {
        console.error('Error updating sermon text:', error);
        throw error;
    }
};

export const hideSermonsBatch = async (sermonIds) => {
    try {
        const response = await axios.patch(`${BASE_URL}/sermons/batch/hide`, sermonIds, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error in hideSermonsBatch:', error);
        throw error;
    }
};

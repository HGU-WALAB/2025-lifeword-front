import { useSetRecoilState, useRecoilValue } from 'recoil';
import {
    isLoggedInState,
    userIdState,
    userEmailState,
    userJobState,
    isAdminState,
    userNameState,
    originalUserIdState,
} from './atoms';

// Custom hook for getting user state
export const useUserState = () => {
    const isLoggedIn = useRecoilValue(isLoggedInState);
    const userId = useRecoilValue(userIdState);
    const userEmail = useRecoilValue(userEmailState);
    const userJob = useRecoilValue(userJobState);
    const isAdmin = useRecoilValue(isAdminState);
    const userName = useRecoilValue(userNameState);

    return {
        isLoggedIn,
        userId,
        userEmail,
        userJob,
        isAdmin,
        userName,
    };
};

// Custom hook for setting user state
export const useSetUserState = () => {
    const setIsLoggedIn = useSetRecoilState(isLoggedInState);
    const setUserId = useSetRecoilState(userIdState);
    const setUserEmail = useSetRecoilState(userEmailState);
    const setUserJob = useSetRecoilState(userJobState);
    const setIsAdmin = useSetRecoilState(isAdminState);
    const setUserName = useSetRecoilState(userNameState);

    return (userData) => {
        if (userData.isLoggedIn !== undefined) {
            setIsLoggedIn(userData.isLoggedIn === 'true');
        }
        if (userData.userId !== undefined) {
            setUserId(userData.userId);
        }
        if (userData.userEmail !== undefined) {
            setUserEmail(userData.userEmail);
        }
        if (userData.job !== undefined) {
            setUserJob(userData.job);
        }
        if (userData.admin !== undefined) {
            setIsAdmin(userData.admin === 'true');
        }
        if (userData.userName !== undefined) {
            setUserName(userData.userName);
        }
    };
};

// Custom hook for clearing user state
export const useClearUserState = () => {
    const setIsLoggedIn = useSetRecoilState(isLoggedInState);
    const setUserId = useSetRecoilState(userIdState);
    const setUserEmail = useSetRecoilState(userEmailState);
    const setUserJob = useSetRecoilState(userJobState);
    const setIsAdmin = useSetRecoilState(isAdminState);
    const setUserName = useSetRecoilState(userNameState);
    const setOriginalUserId = useSetRecoilState(originalUserIdState);

    return () => {
        setIsLoggedIn(false);
        setUserId('');
        setUserEmail('');
        setUserJob('');
        setIsAdmin(false);
        setUserName('');
        setOriginalUserId('');
    };
};

// Custom hook for managing original user ID (admin feature)
export const useOriginalUserId = () => {
    const setOriginalUserId = useSetRecoilState(originalUserIdState);
    const originalUserId = useRecoilValue(originalUserIdState);

    const setId = (userId) => {
        setOriginalUserId(userId || '');
    };

    return [originalUserId, setId];
};

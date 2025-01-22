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
import { useCallback } from 'react';

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

    return useCallback(
        ({ isLoggedIn, userId, userEmail, job, admin, userName }) => {
            setIsLoggedIn(isLoggedIn === true || isLoggedIn === 'true');
            setUserId(userId || '');
            setUserEmail(userEmail || '');
            setUserJob(job || '');
            // admin 값을 boolean으로 변환
            setIsAdmin(admin === true || admin === 1 || admin === '1' || admin === 'true');
            setUserName(userName || '');
        },
        [setIsLoggedIn, setUserId, setUserEmail, setUserJob, setIsAdmin, setUserName]
    );
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

import { useRecoilValue, useSetRecoilState, useResetRecoilState } from 'recoil';
import {
    userState,
    userIdState,
    userEmailState,
    userJobState,
    roleState,
    userNameState,
    isLoggedInState,
} from './atoms';

export const useUserState = () => {
    const user = useRecoilValue(userState);
    const role = useRecoilValue(roleState);
    const isAdmin = role === 'ADMIN';

    return {
        ...user,
        role,
        isAdmin,
    };
};

export const useSetUserState = () => {
    const setUserState = useSetRecoilState(userState);
    const setUserId = useSetRecoilState(userIdState);
    const setUserEmail = useSetRecoilState(userEmailState);
    const setUserJob = useSetRecoilState(userJobState);
    const setRole = useSetRecoilState(roleState);
    const setUserName = useSetRecoilState(userNameState);
    const setIsLoggedIn = useSetRecoilState(isLoggedInState);

    return (newState) => {
        setUserState(newState);
        setUserId(newState.userId);
        setUserEmail(newState.userEmail);
        setUserJob(newState.job);
        setRole(newState.admin ? 'ADMIN' : 'USER');
        setUserName(newState.userName);
        setIsLoggedIn(newState.isLoggedIn);
    };
};

export const useClearUserState = () => {
    const resetUserState = useResetRecoilState(userState);
    const resetUserId = useResetRecoilState(userIdState);
    const resetUserEmail = useResetRecoilState(userEmailState);
    const resetUserJob = useResetRecoilState(userJobState);
    const resetRole = useResetRecoilState(roleState);
    const resetUserName = useResetRecoilState(userNameState);
    const resetIsLoggedIn = useResetRecoilState(isLoggedInState);

    return () => {
        resetUserState();
        resetUserId();
        resetUserEmail();
        resetUserJob();
        resetRole();
        resetUserName();
        resetIsLoggedIn();
    };
};

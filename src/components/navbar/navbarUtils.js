import { useClearUserState } from '../../recoil/utils';

export const useLogout = () => {
    const clearUserState = useClearUserState();

    return () => {
        clearUserState();
        window.location.href = '/lifeword';
    };
};

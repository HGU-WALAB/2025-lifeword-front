import { useClearUserState } from '../../recoil/utils';
import { logout } from '../../services/APIService';

export const useLogout = () => {
    const clearUserState = useClearUserState();

    return async () => {
        try {
            await logout();
            clearUserState();
            window.location.href = '/lifeword';
        } catch (error) {
            console.error('Logout failed:', error);
            // 에러가 발생해도 일단 로컬 상태는 클리어
            clearUserState();
            window.location.href = '/lifeword';
        }
    };
};

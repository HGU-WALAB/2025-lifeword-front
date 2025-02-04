import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist();

// User authentication state
export const isLoggedInState = atom({
    key: 'isLoggedInState',
    default: false,
    effects_UNSTABLE: [persistAtom],
});

// User information states
export const userIdState = atom({
    key: 'userIdState',
    default: '',
    effects_UNSTABLE: [persistAtom],
});

export const userEmailState = atom({
    key: 'userEmailState',
    default: '',
    effects_UNSTABLE: [persistAtom],
});

export const userJobState = atom({
    key: 'userJobState',
    default: '',
    effects_UNSTABLE: [persistAtom],
});

export const isAdminState = atom({
    key: 'isAdminState',
    default: false,
    effects_UNSTABLE: [persistAtom],
});

export const userNameState = atom({
    key: 'userNameState',
    default: '',
    effects_UNSTABLE: [persistAtom],
});

// Temporary state for admin operations
export const originalUserIdState = atom({
    key: 'originalUserIdState',
    default: '',
    effects_UNSTABLE: [persistAtom],
});

// Combined user state
export const userState = atom({
    key: 'userState',
    default: {
        isLoggedIn: false,
        userId: '',
        userEmail: '',
        userName: '',
        job: '',
        admin: false,
    },
    effects_UNSTABLE: [persistAtom],
});

export const isNavExpandedState = atom({
    key: 'isNavExpandedState',
    default: true,
    effects_UNSTABLE: [persistAtom],
});

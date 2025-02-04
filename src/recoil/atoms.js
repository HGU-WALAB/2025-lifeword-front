import { atom } from 'recoil';

// User authentication state
export const isLoggedInState = atom({
    key: 'isLoggedInState',
    default: false,
});

// User information states
export const userIdState = atom({
    key: 'userIdState',
    default: '',
});

export const userEmailState = atom({
    key: 'userEmailState',
    default: '',
});

export const userJobState = atom({
    key: 'userJobState',
    default: '',
});

export const isAdminState = atom({
    key: 'isAdminState',
    default: false,
});

export const userNameState = atom({
    key: 'userNameState',
    default: '',
});

// Temporary state for admin operations
export const originalUserIdState = atom({
    key: 'originalUserIdState',
    default: '',
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
});

export const isNavExpandedState = atom({
    key: 'isNavExpandedState',
    default: true,
});

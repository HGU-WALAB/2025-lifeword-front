import { initializeApp } from '@firebase/app';
import {
    getAuth as getFirebaseAuth,
    RecaptchaVerifier as FirebaseRecaptchaVerifier,
    signInWithPhoneNumber as firebaseSignInWithPhoneNumber,
} from '@firebase/auth';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getFirebaseAuth(app);
auth.languageCode = 'ko';

let recaptchaVerifier = null;

export const setupRecaptcha = () => {
    try {
        if (!recaptchaVerifier) {
            recaptchaVerifier = new FirebaseRecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => {
                    console.log('reCAPTCHA verified');
                },
                'expired-callback': () => {
                    console.log('reCAPTCHA expired');
                    recaptchaVerifier = null;
                },
            });
        }
    } catch (error) {
        console.error('Error setting up reCAPTCHA:', error);
        recaptchaVerifier = null;
    }
};

export const requestPhoneVerification = async (phoneNumber) => {
    try {
        const cleaned = phoneNumber.replace(/[^0-9]/g, '');
        if (!cleaned.startsWith('010') || cleaned.length !== 11) {
            throw new Error('올바른 전화번호 형식이 아닙니다.');
        }
        const formattedPhone = `+82${cleaned.slice(1)}`;

        console.log('Sending verification to:', formattedPhone);

        if (!recaptchaVerifier) {
            setupRecaptcha();
        }

        // reCAPTCHA를 먼저 렌더링
        await recaptchaVerifier.render();

        const confirmationResult = await firebaseSignInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
        window.confirmationResult = confirmationResult;

        return { success: true };
    } catch (error) {
        console.error('SMS failed:', error);
        if (recaptchaVerifier) {
            recaptchaVerifier.clear();
            recaptchaVerifier = null;
        }
        return {
            success: false,
            error: error.code === 'auth/invalid-phone-number' ? '올바른 전화번호 형식이 아닙니다.' : error.message,
        };
    }
};

export const verifyPhoneNumber = async (verificationCode) => {
    try {
        if (!window.confirmationResult) {
            throw new Error('먼저 인증번호를 요청해주세요.');
        }
        const result = await window.confirmationResult.confirm(verificationCode);
        return { success: true, user: result.user };
    } catch (error) {
        console.error('Verification failed:', error);
        return {
            success: false,
            error: error.code === 'auth/invalid-verification-code' ? '잘못된 인증번호입니다.' : error.message,
        };
    }
};

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { createGlobalStyle } from 'styled-components';
import { isLoggedInState } from './recoil/atoms';
import Onboarding from './Onboarding/Onboarding';
import MainPage from './pages/MainPage';
import AuthCallback from './components/login/AuthCallback';
import SignUpPageSocial from './components/login/SignUpPageSocial';
import SignUpPageBibly from './components/login/SignUpPageBibly';

const GlobalStyle = createGlobalStyle`
    body {
        cursor: url('http://www.rw-designer.com/cursor-extern.php?id=50627'), auto;
    }

    a {
        cursor: url('http://www.rw-designer.com/cursor-extern.php?id=50627'), pointer;
    }

    button {
        cursor: url('http://www.rw-designer.com/cursor-extern.php?id=50627'), pointer;
    }
`;

function App() {
    return (
        <RecoilRoot>
            <GlobalStyle />
            <ParallaxProvider>
                <Router basename="/eax9952">
                    <Routes>
                        <Route path="/" element={<Onboarding />} />
                        <Route path="/auth" element={<AuthCallback />} />
                        <Route path="/signup" element={<SignUpPageSocial />} />
                        <Route path="/signup-bibly" element={<SignUpPageBibly />} />
                        <Route path="/main/*" element={<MainPage />} />
                    </Routes>
                </Router>
            </ParallaxProvider>
        </RecoilRoot>
    );
}

export default App;

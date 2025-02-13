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
import BookmarkSermonDetailPage from './components/mypage/BookmarkSermonDetailPage';

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

const ProtectedRoute = ({ children }) => {
    const isLoggedIn = useRecoilValue(isLoggedInState);

    if (!isLoggedIn) {
        return <Navigate to="/" replace />;
    }

    return children;
};

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
                        <Route
                            path="/main/*"
                            element={
                                <ProtectedRoute>
                                    <MainPage />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="mypage/sermon/:id" element={<BookmarkSermonDetailPage />} />
                        </Route>
                    </Routes>
                </Router>
            </ParallaxProvider>
        </RecoilRoot>
    );
}

export default App;

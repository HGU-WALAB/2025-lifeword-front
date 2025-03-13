import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax';
import { RecoilRoot } from 'recoil';
import { createGlobalStyle } from 'styled-components';
import Onboarding from './Onboarding/Onboarding';
import MainPage from './pages/MainPage';
import AuthCallback from './components/login/AuthCallback';
import SignUpPageSocial from './components/login/SignUpPageSocial';
import SignUpPageBibly from './components/login/SignUpPageBibly';
import BookmarkSermonDetailPage from './components/mypage/BookmarkSermonDetailPage';

const GlobalStyle = createGlobalStyle`
  body {
    cursor: url('http://www.rw-designer.com/cursor-extern.php?id=50627'), auto;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  a {
    cursor: url('http://www.rw-designer.com/cursor-extern.php?id=50627'), pointer;
    text-decoration: none;
    color: inherit;
  }
  
  button {
    cursor: url('http://www.rw-designer.com/cursor-extern.php?id=50627'), pointer;
  }
`;

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const isAuthed = await checkAuth();
                setIsAuthenticated(isAuthed);
                if (!isAuthed) {
                    navigate('/', { replace: true });
                }
            } catch (error) {
                console.error('Auth verification failed:', error);
                navigate('/', { replace: true });
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, [navigate]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? children : null;
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

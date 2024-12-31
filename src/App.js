import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax';
import Onboarding from './Onboarding/Onboarding';
import MainPage from './pages/MainPage';
import AuthCallback from './components/AuthCallback';

const ProtectedRoute = ({ children }) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    console.log('ProtectedRoute - Login status:', isLoggedIn);

    if (!isLoggedIn) {
        console.log('Not logged in, redirecting to onboarding...');
        return <Navigate to="/onboarding" replace />;
    }

    console.log('Logged in, rendering protected content...');
    return children;
};

function App() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    console.log('App - Initial login status:', isLoggedIn);

    return (
        <Router basename="/eax9952">
            <ParallaxProvider>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <MainPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/onboarding" element={isLoggedIn ? <Navigate to="/" replace /> : <Onboarding />} />
                    <Route path="/auth" element={<AuthCallback />} />
                    <Route
                        path="*"
                        element={isLoggedIn ? <Navigate to="/" replace /> : <Navigate to="/onboarding" replace />}
                    />
                </Routes>
            </ParallaxProvider>
        </Router>
    );
}

export default App;

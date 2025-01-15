import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax';
import Onboarding from './Onboarding/Onboarding';
import MainPage from './pages/MainPage';
import AuthCallback from './components/AuthCallback';
import SignUpPage from './components/SignUpPage';

function App() {
    return (
        <ParallaxProvider>
            <Router basename="/eax9952">
                <Routes>
                    <Route path="/" element={<Onboarding />} />
                    <Route path="/auth" element={<AuthCallback />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/main/*" element={<MainPage />} />
                </Routes>
            </Router>
        </ParallaxProvider>
    );
}

export default App;

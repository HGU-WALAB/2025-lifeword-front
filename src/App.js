import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import SignUpPage from './components/SignUpPage';
import AuthCallback from './components/AuthCallback';
import AddSermonPage from './components/AddSermonPage';
import QuickReadingPage from './components/QuickReadingPage';
import SermonListPage from './components/SermonListPage';
import SearchPage from './components/SearchPage';
import BookmarkPage from './components/BookmarkPage';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('UID') !== null;
    return isAuthenticated ? children : <Navigate to="/signup" />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/" element={<Navigate to="/signup" />} />

                {/* Protected Routes */}
                <Route
                    path="/main"
                    element={
                        <PrivateRoute>
                            <MainPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/add-sermon"
                    element={
                        <PrivateRoute>
                            <AddSermonPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/quick-reading"
                    element={
                        <PrivateRoute>
                            <QuickReadingPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/sermon-list"
                    element={
                        <PrivateRoute>
                            <SermonListPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/search"
                    element={
                        <PrivateRoute>
                            <SearchPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/bookmark"
                    element={
                        <PrivateRoute>
                            <BookmarkPage />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;

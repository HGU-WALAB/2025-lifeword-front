import React from 'react';
import AdminNavbar from './navbar/AdminNavbar';
import PastorNavbar from './navbar/PastorNavbar';
import BelieverNavbar from './navbar/BelieverNavbar';

const MainNavbar = () => {
    const isAdmin = localStorage.getItem('admin') === 'true';
    const isPastor = localStorage.getItem('job') === '목회자';

    if (isAdmin) {
        return <AdminNavbar />;
    } else if (isPastor) {
        return <PastorNavbar />;
    } else {
        return <BelieverNavbar />;
    }
};

export default MainNavbar;

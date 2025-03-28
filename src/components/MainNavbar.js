import React from 'react';
import AdminNavbar from './navbar/AdminNavbar';
import PastorNavbar from './navbar/PastorNavbar';
import BelieverNavbar from './navbar/BelieverNavbar';
import { useUserState } from '../recoil/utils';

const MainNavbar = () => {
    const { role, userJob } = useUserState();
    const isPastor = userJob === '목회자';

    if (role === 'ADMIN') {
        return <AdminNavbar />;
    } else if (isPastor) {
        return <PastorNavbar />;
    } else {
        return <BelieverNavbar />;
    }
};

export default MainNavbar;

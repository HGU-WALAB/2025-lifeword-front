export const handleLogout = () => {
    localStorage.removeItem('UID');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('_grecaptcha');
    localStorage.removeItem('userName');
    localStorage.removeItem('job');
    localStorage.removeItem('admin');

    window.location.href = '/eax9952';
};

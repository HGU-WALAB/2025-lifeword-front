import styled from 'styled-components';

export const NavContainer = styled.nav`
    width: 280px;
    height: 100vh;
    background-color: #1a1a1a;
    padding: 20px;
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
`;

export const LogoContainer = styled.div`
    padding: 20px 0;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const Logo = styled.img`
    width: 170px;
    height: auto;
`;

export const NavItems = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 20px;
`;

export const NavItem = styled.button`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    width: 100%;
    color: ${(props) => (props.active ? '#ffffff' : '#9ca3af')};
    border: none;
    background: ${(props) => (props.active ? '#2d2d2d' : 'none')};
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: #2d2d2d;
        color: #ffffff;
    }
`;

export const LogoutButton = styled(NavItem)`
    margin-top: auto;
    margin-bottom: 30px;
    color: #9ca3af;

    &:hover {
        color: #ef4444;
        background-color: rgba(239, 68, 68, 0.1);
    }
`;

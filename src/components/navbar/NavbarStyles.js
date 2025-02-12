import styled from "styled-components";

export const NavContainer = styled.nav`
  width: ${(props) => (props.isExpanded ? "280px" : "80px")};
  height: 100vh;
  background-color: #1a1a1a;
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  transition: all 0.3s ease;
  z-index: 1000;
`;

export const ToggleButton = styled.button`
  position: absolute;
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  border: 2px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #4f3296;
  z-index: 1001;

  &:hover {
    background: #4f3296;
    border-color: #4f3296;
    color: white;
    transform: translateY(-50%) scale(1.1);
  }

  svg {
    width: 18px;
    height: 18px;
    transition: transform 0.3s ease;
    transform: ${(props) =>
      props.isExpanded ? "rotate(0deg)" : "rotate(180deg)"};
  }
`;

export const LogoContainer = styled.div`
  padding: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  transition: all 0.3s ease;
`;

export const Logo = styled.img`
  width: ${(props) => (props.isExpanded ? "170px" : "56px")};
  height: 56px;
  cursor: pointer;
  transition: all 0.3s ease;
`;

export const NavItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
  overflow: hidden;
`;

export const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px ${(props) => (props.isExpanded ? "16px" : "0")};
  width: 100%;
  color: ${(props) => (props.active ? "#ffffff" : "#9ca3af")};
  border: none;
  background: ${(props) => (props.active ? "#2d2d2d" : "none")};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  justify-content: ${(props) => (props.isExpanded ? "flex-start" : "center")};

  span {
    display: ${(props) => (props.isExpanded ? "block" : "none")};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

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

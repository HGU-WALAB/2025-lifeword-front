import styled, { keyframes } from 'styled-components';

const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const SpinnerWrapper = styled.div`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    animation: ${fadeIn} 0.3s ease;
`;

const Spinner = styled.div`
    width: 40px;
    height: 40px;
    border: 4px solid #f3f0ff;
    border-top: 4px solid #6b4ee6;
    border-radius: 50%;
    animation: ${spin} 0.8s linear infinite;
`;

const LoadingText = styled.div`
    color: #6b4ee6;
    font-size: 14px;
    font-weight: 500;
`;

const LoadingSpinner = ({ text = '로딩 중...' }) => (
    <SpinnerWrapper>
        <Spinner />
        <LoadingText>{text}</LoadingText>
    </SpinnerWrapper>
);

export default LoadingSpinner;

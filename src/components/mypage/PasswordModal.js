import React from 'react';
import styled from 'styled-components';

const PasswordModal = ({
                           newPassword,
                           setNewPassword,
                           newPasswordConfirm,
                           setNewPasswordConfirm,
                           passwordMatchMessage,
                           handlePasswordCheckChange,
                           handlePasswordConfirmChange,
                           handlePasswordChange,
                           onClose,
                       }) => {
    return (
        <ModalOverlay>
            <ModalContent>
                <ModalHeader>
                    <h3>비밀번호 변경</h3>
                </ModalHeader>
                <ModalBody>
                    <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => handlePasswordCheckChange(e.target.value)}
                        placeholder="새로운 비밀번호 입력"
                    />
                    <Input
                        type="password"
                        value={newPasswordConfirm}
                        onChange={(e) => handlePasswordConfirmChange(e.target.value)}
                        placeholder="새로운 비밀번호 확인"
                    />
                    <PasswordMessage isMatch={newPassword && newPassword === newPasswordConfirm}>
                        {newPassword && newPasswordConfirm && passwordMatchMessage}
                    </PasswordMessage>
                </ModalBody>
                <ModalFooter>
                    <ButtonWrapper>
                        <SubmitButton
                            onClick={handlePasswordChange}
                            disabled={newPassword !== newPasswordConfirm || !newPassword || !newPasswordConfirm}
                        >
                            변경하기
                        </SubmitButton>
                        <CancelButton onClick={onClose}>취소</CancelButton>
                    </ButtonWrapper>
                </ModalFooter>
            </ModalContent>
        </ModalOverlay>
    );
};

// 스타일 부분
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ModalContent = styled.div`
    background: rgba(255, 255, 255, 1);
    padding: 1.5rem;
    border-radius: 12px;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
    font-size: 1.8rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 1rem;
`;

const ModalBody = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 450px;
    margin: 0 auto; /* 중앙 정렬 */
    padding: 0 1rem; /* 좌우 패딩 추가로 수직 정렬 보정 */
    gap: 1.5rem; /* 입력 칸 간격 조정 */
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
    margin-top: 1.5rem;
`;

const ButtonWrapper = styled.div`
    display: flex;
    gap: 1rem;
    width: 100%;
    max-width: 450px; /* 입력칸과 폭을 동일하게 설정 */
    justify-content: center;
`;

const PasswordMessage = styled.div`
    font-size: 1rem;
    color: ${(props) => (props.isMatch ? 'green' : 'red')};
    min-height: 1.5rem; /* 최소 높이 설정으로 모달 크기 변화 방지 */
    display: flex;
    align-items: center; /* 메시지 수직 중앙 정렬 */
`;

const Input = styled.input`
    padding: 1rem;
    border: 2px solid #eee;
    border-radius: 8px;
    font-size: 1.1rem;
    width: 100%;
    max-width: 450px;
    box-sizing: border-box;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #4f3296;
        box-shadow: 0 0 0 3px rgba(79, 50, 150, 0.2);
    }
`;

const SubmitButton = styled.button`
    padding: 1rem;
    background-color: #4f3296;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    flex: 1;
    box-sizing: border-box;
    transition: all 0.2s ease;

    &:hover {
        background-color: #3a2570;
    }

    &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
`;

const CancelButton = styled(SubmitButton)`
    background-color: #e9ecef;
    color: #495057;

    &:hover {
        background-color: #dee2e6;
    }
`;

export default PasswordModal;

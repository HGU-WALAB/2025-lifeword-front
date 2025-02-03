import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { login } from '../../services/APIService';
import { useSetUserState } from '../../recoil/utils';

const LoginForm = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const setUserState = useSetUserState();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login(email, password, setUserState);
            if (response.success) {
                navigate('/main');
            } else {
                alert('로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('로그인 중 오류가 발생했습니다.');
        }
    };

    return (
        <Container>
            <FormContainer>
                <Title>로그인</Title>
                <Form onSubmit={handleSubmit}>
                    <Input
                        type="email"
                        placeholder="이메일"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <SubmitButton type="submit">로그인</SubmitButton>
                    <SignUpButton type="button" onClick={() => navigate('/signup-bibly')}>
                        회원가입하기
                    </SignUpButton>
                </Form>
            </FormContainer>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
`;

const FormContainer = styled.div`
    background: rgba(255, 255, 255, 0.95);
    padding: 2rem;
    border-radius: 12px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
    color: #333;
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const Input = styled.input`
    padding: 0.8rem 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;

    &:focus {
        outline: none;
        border-color: #4f3296;
    }
`;

const SubmitButton = styled.button`
    padding: 1rem;
    background: #4f3296;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
        background: #3a2570;
    }
`;

const SignUpButton = styled(SubmitButton)`
    background: white;
    color: #4f3296;
    border: 1px solid #4f3296;

    &:hover {
        background: #f8f5ff;
    }
`;

export default LoginForm;

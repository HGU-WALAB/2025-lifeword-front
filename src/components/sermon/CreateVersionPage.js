import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft } from 'lucide-react';
import { createText } from '../../services/APIService';
import SermonEditor from '../Editor/SermonEditor';
import { useUserState } from '../../recoil/utils';

const CreateVersionPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { userId } = useUserState();
    const editorRef = useRef(null);

    const [versionData, setVersionData] = useState({
        textTitle: '',
        contentText: '',
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setVersionData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditorChange = (content) => {
        setVersionData((prev) => ({
            ...prev,
            contentText: content,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const editorContent = editorRef.current?.getContent();
        console.log('Editor Content:', editorContent);
        console.log('Version Title:', versionData.textTitle);

        if (!versionData.textTitle || !editorContent) {
            alert('제목과 내용은 필수 입력사항입니다.');
            return;
        }

        try {
            const cleanContent = editorContent.replace(/<span class="ql-cursor">.*?<\/span>/g, '');
            const response = await createText(id, userId, false, versionData.textTitle, cleanContent);

            // 응답이 문자열로 오는 경우 처리
            if (response === 'Added successfully' || response.success) {
                alert('버전이 생성되었습니다.');
                navigate(-1);
            } else {
                alert('버전 생성에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error details:', error);
            alert('버전 생성 중 오류가 발생했습니다.');
        }
    };

    return (
        <Container>
            <Header>
                <BackButton onClick={() => navigate(-1)}>
                    <ArrowLeft />
                    뒤로가기
                </BackButton>
                <SaveButton onClick={handleSubmit}>저장</SaveButton>
            </Header>
            <EditorContainer>
                <TitleInput
                    type="text"
                    name="textTitle"
                    value={versionData.textTitle}
                    onChange={handleInputChange}
                    placeholder="버전 제목을 입력하세요"
                />
                <EditorWrapper>
                    <SermonEditor ref={editorRef} onChange={handleEditorChange} value={versionData.contentText} />
                </EditorWrapper>
            </EditorContainer>
        </Container>
    );
};

// AddSermonPage의 스타일을 재사용
const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
`;

const BackButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: transparent;
    border: none;
    color: #4f3296;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 8px;

    &:hover {
        background: #f3f4f6;
    }
`;

const SaveButton = styled.button`
    padding: 8px 24px;
    background: #4f3296;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #3a2570;
    }
`;

const EditorContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const TitleInput = styled.input`
    width: 100%;
    padding: 16px;
    font-size: 24px;
    border: none;
    border-bottom: 2px solid #e9ecef;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
        border-color: #4f3296;
    }

    &::placeholder {
        color: #adb5bd;
    }
`;

const EditorWrapper = styled.div`
    border: 1px solid #e9ecef;
    border-radius: 8px;
    overflow: hidden;
`;

export default CreateVersionPage;

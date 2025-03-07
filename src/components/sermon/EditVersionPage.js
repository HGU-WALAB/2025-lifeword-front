import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft } from 'lucide-react';
import { getTextDetail, updateText } from '../../services/APIService';
import SermonEditor from '../Editor/SermonEditor';
import { useUserState } from '../../recoil/utils';

const EditVersionPage = () => {
    const navigate = useNavigate();
    const { id, textId } = useParams();
    const { userId } = useUserState();
    const editorRef = useRef(null);

    const [versionData, setVersionData] = useState({
        textTitle: '',
        contentText: '',
    });

    useEffect(() => {
        const fetchVersionDetail = async () => {
            try {
                const response = await getTextDetail(id, textId, userId);
                if (response) {
                    setVersionData({
                        textTitle: response.textTitle,
                        contentText: response.textContent,
                    });
                }
            } catch (error) {
                console.error('Error fetching version detail:', error);
                alert('버전 정보를 불러오는데 실패했습니다.');
            }
        };

        if (id && textId && userId) {
            fetchVersionDetail();
        }
    }, [id, textId, userId]);

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

        if (!versionData.textTitle || !editorContent) {
            alert('제목과 내용은 필수 입력사항입니다.');
            return;
        }

        try {
            const cleanContent = editorContent.replace(/<span class="ql-cursor">.*?<\/span>/g, '');
            const response = await updateText(textId, userId, versionData.textTitle, false, cleanContent);

            if (response.success || response === 'Updated successfully') {
                alert('버전이 수정되었습니다.');
                navigate(-1);
            } else {
                alert('버전 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error updating version:', error);
            alert('버전 수정 중 오류가 발생했습니다.');
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

export default EditVersionPage;

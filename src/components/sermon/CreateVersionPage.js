import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft } from 'lucide-react';
import { createText, getSermonDetail } from '../../services/APIService';
import SermonEditor from '../Editor/SermonEditor';
import { useUserState } from '../../recoil/utils';
import SermonHeader from './SermonHeader';

const CreateVersionPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { userId } = useUserState();
    const editorRef = useRef(null);
    const [sermon, setSermon] = useState(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    const [versionData, setVersionData] = useState({
        textTitle: '',
        contentText: '',
    });

    useEffect(() => {
        const fetchSermonDetail = async () => {
            try {
                const data = await getSermonDetail(id);
                setSermon(data);
            } catch (error) {
                console.error('Error fetching sermon detail:', error);
            }
        };

        if (id) {
            fetchSermonDetail();
        }
    }, [id]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const toolbar = document.querySelector('.ql-toolbar');
        if (!toolbar) return;

        const handleScroll = () => {
            const toolbarRect = toolbar.getBoundingClientRect();
            const isStuck = toolbarRect.top <= headerHeight;
            toolbar.setAttribute('data-stuck', String(isStuck));
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [headerHeight]);

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
            {sermon && <SermonHeader sermon={sermon} onHeightChange={setHeaderHeight} />}
            <ContentWrapper>
                <Header>
                    <BackButton onClick={() => navigate(-1)}>
                        <ArrowLeft />
                        뒤로가기
                    </BackButton>
                    <SaveButton onClick={handleSubmit}>생성 완료</SaveButton>
                </Header>
                <EditorContainer headerHeight={headerHeight}>
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
            </ContentWrapper>
        </Container>
    );
};

const Container = styled.div`
    min-height: 100vh;
    background: white;
`;

const ContentWrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
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
    gap: 0;
    position: relative;

    .ql-toolbar {
        position: sticky;
        top: ${({ headerHeight }) => headerHeight}px;
        z-index: 100;
        background: white;
        border: 1px solid #e9ecef;
        border-bottom: none;
        padding: 12px;
        border-radius: 8px 8px 0 0;
        transition: border-radius 0.2s ease;

        &:before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 8px 8px 0 0;
            transition: border-radius 0.2s ease;
        }

        &[data-stuck='true'] {
            border-radius: 0;
            &:before {
                border-radius: 0;
            }
        }
    }

    .ql-container {
        border: 1px solid #e9ecef;
        border-top: none;
        border-radius: 0 0 8px 8px;
        margin-top: 0;
    }

    .ql-editor {
        min-height: 500px;
        padding: 24px;
        font-size: 16px;
        line-height: 1.8;
    }
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
    margin-top: 16px;
`;

export default CreateVersionPage;

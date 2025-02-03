import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { createSermon } from '../../services/APIService';
import SermonEditor from '../Editor/SermonEditor';
import { useUserState } from '../../recoil/utils';

const AddSermonPage = () => {
    const { userId } = useUserState();
    const [sermonData, setSermonData] = useState({
        sermonDate: '',
        worshipType: '',
        mainScripture: '',
        additionalScripture: '',
        sermonTitle: '',
        summary: '',
        notes: '',
        recordInfo: '',
        contentText: '',
        public: true,
    });
    const editorRef = useRef(null);
    const [autoSaveStatus, setAutoSaveStatus] = useState('');
    const [isMetaSectionOpen, setIsMetaSectionOpen] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const autoSaveTimer = setTimeout(() => {
            if (sermonData.contentText) {
                localStorage.setItem('sermon_draft', JSON.stringify(sermonData));
                setAutoSaveStatus('임시저장됨');

                setTimeout(() => setAutoSaveStatus(''), 2000);
            }
        }, 30000);

        return () => clearTimeout(autoSaveTimer);
    }, [sermonData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSermonData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditorChange = (content) => {
        setSermonData((prev) => ({
            ...prev,
            contentText: content,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!sermonData.sermonTitle || !sermonData.sermonDate || !sermonData.contentText) {
            alert('제목, 날짜, 내용은 필수 입력사항입니다.');
            return;
        }

        try {
            if (!userId) {
                alert('로그인이 필요합니다.');
                return;
            }

            const cleanContent = sermonData.contentText.replace(/<span class="ql-cursor">.*?<\/span>/g, '');

            const submitData = {
                ...sermonData,
                contentText: cleanContent,
                userId,
            };

            const response = await createSermon(submitData);

            if (response) {
                alert('설교가 성공적으로 등록되었습니다.');
                setSermonData({
                    sermonDate: '',
                    worshipType: '',
                    mainScripture: '',
                    additionalScripture: '',
                    sermonTitle: '',
                    summary: '',
                    notes: '',
                    recordInfo: '',
                    contentText: '',
                    public: true,
                });

                if (editorRef.current) {
                    editorRef.current.clearEditor();
                }
            } else {
                alert('설교 등록에 실패했습니다.');
            }
        } catch (error) {
            alert('설교 등록 중 오류가 발생했습니다.');
        }
    };

    const toggleMetaSection = () => {
        setIsMetaSectionOpen(!isMetaSectionOpen);
    };

    return (
        <Container>
            <PageHeader>
                <Title>설교 작성하기</Title>
                <Description>새로운 설교를 기록해보세요.</Description>
            </PageHeader>

            <FormContainer onSubmit={handleSubmit} isMetaOpen={isMetaSectionOpen}>
                <MetaSectionWrapper isOpen={isMetaSectionOpen}>
                    <ToggleButton onClick={toggleMetaSection} type="button">
                        {isMetaSectionOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </ToggleButton>
                    <MetaSection isOpen={isMetaSectionOpen}>
                        <FormSection>
                            <Label>설교 날짜</Label>
                            <DateInputWrapper>
                                <CalendarIcon size={20} />
                                <DateInput
                                    type="date"
                                    name="sermonDate"
                                    value={sermonData.sermonDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </DateInputWrapper>
                        </FormSection>

                        <FormSection>
                            <Label>예배 종류</Label>
                            <Input
                                type="text"
                                name="worshipType"
                                value={sermonData.worshipType}
                                onChange={handleInputChange}
                                placeholder="예) 주일-새벽, 주일오전, 수요저녁, 금요철야"
                                required
                            />
                        </FormSection>

                        <FormSection>
                            <Label>설교 제목</Label>
                            <Input
                                type="text"
                                name="sermonTitle"
                                value={sermonData.sermonTitle}
                                onChange={handleInputChange}
                                placeholder="설교 제목을 입력하세요"
                                required
                            />
                        </FormSection>

                        <FormGrid>
                            <FormSection>
                                <Label>주 성경 본문</Label>
                                <Input
                                    type="text"
                                    name="mainScripture"
                                    value={sermonData.mainScripture}
                                    onChange={handleInputChange}
                                    placeholder="예) 요한복음 3:16"
                                    required
                                />
                            </FormSection>

                            <FormSection>
                                <Label>추가 성경 본문</Label>
                                <Input
                                    type="text"
                                    name="additionalScripture"
                                    value={sermonData.additionalScripture}
                                    onChange={handleInputChange}
                                    placeholder="예) 로마서 8:28"
                                />
                            </FormSection>
                        </FormGrid>

                        <FormSection>
                            <Label>설교 요약</Label>
                            <TextArea
                                name="summary"
                                value={sermonData.summary}
                                onChange={handleInputChange}
                                placeholder="설교의 주요 내용을 요약해서 입력하세요"
                                rows={4}
                                required
                            />
                        </FormSection>

                        <FormSection>
                            <Label>노트</Label>
                            <TextArea
                                name="notes"
                                value={sermonData.notes}
                                onChange={handleInputChange}
                                placeholder="추가 노트를 입력하세요"
                                rows={3}
                            />
                        </FormSection>

                        <FormSection>
                            <Label>설교록 정보</Label>
                            <Input
                                type="text"
                                name="recordInfo"
                                value={sermonData.recordInfo}
                                onChange={handleInputChange}
                                placeholder="예) 234호 308쪽"
                            />
                        </FormSection>

                        <SubmitButton type="submit">설교 등록하기</SubmitButton>
                    </MetaSection>
                </MetaSectionWrapper>

                <EditorContainer className="editor-container" isMetaOpen={isMetaSectionOpen}>
                    <Label>설교 내용</Label>
                    <SermonEditor ref={editorRef} onChange={handleEditorChange} style={{ flex: 1 }} />
                </EditorContainer>
            </FormContainer>

            <AutoSaveStatus visible={!!autoSaveStatus}>{autoSaveStatus}</AutoSaveStatus>
        </Container>
    );
};

const Container = styled.div`
    margin-left: 280px;
    padding: 40px;
    width: calc(100vw - 360px);
    background-color: #f5f5f5;
    min-height: 100vh;
    overflow-y: auto;
`;

const PageHeader = styled.div`
    margin-bottom: 40px;
    width: 100%;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    color: #333;
    margin-bottom: 0.5rem;
    font-weight: 600;
`;

const Description = styled.p`
    color: #666;
    font-size: 1.1rem;
`;

const FormContainer = styled.form`
    display: grid;
    grid-template-columns: ${(props) => (props.isMetaOpen ? '400px 1fr' : '50px 1fr')};
    gap: 32px;
    max-width: 1200px;
    margin: 0 auto;
    margin-bottom: 40px;
    transition: all 0.3s ease;
    align-items: start;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
        padding: 0 20px;
    }
`;

const MetaSectionWrapper = styled.div`
    position: relative;
    min-width: ${(props) => (props.isOpen ? '400px' : '50px')};
    transition: all 0.3s ease;
`;

const MetaSection = styled.div`
    background: white;
    padding: 32px;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    height: fit-content;
    transform: translateX(${(props) => (props.isOpen ? '0' : '-100%')});
    opacity: ${(props) => (props.isOpen ? 1 : 0)};
    visibility: ${(props) => (props.isOpen ? 'visible' : 'hidden')};
    transition: all 0.3s ease;
`;

const ToggleButton = styled.button`
    position: absolute;
    right: -16px;
    top: 20px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: white;
    border: 2px solid #eee;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    color: #4f3296;

    &:hover {
        background: #4f3296;
        border-color: #4f3296;
        color: white;
        transform: scale(1.1);
    }

    svg {
        width: 18px;
        height: 18px;
        transition: all 0.2s ease;
    }
`;

const EditorContainer = styled.div`
    background: white;
    padding: 32px;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    min-height: 950px;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 40px;
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 32px;

    @media (max-width: 500px) {
        grid-template-columns: 1fr;
    }
`;

const FormSection = styled.div`
    margin-bottom: 32px;
    padding-right: 20px;

    &:last-child {
        margin-bottom: 0;
    }
`;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-weight: 500;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #eee;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s ease;
    background-color: white;

    &:focus {
        outline: none;
        border-color: #4f3296;
        box-shadow: 0 0 0 3px rgba(79, 50, 150, 0.1);
    }

    &::placeholder {
        color: #aaa;
    }
`;

const DateInputWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;

    svg {
        position: absolute;
        left: 16px;
        color: #4f3296;
    }
`;

const DateInput = styled(Input)`
    padding-left: 48px;
`;

const TextArea = styled.textarea`
    width: 100%;
    padding: 16px;
    border: 2px solid #eee;
    border-radius: 8px;
    font-size: 1rem;
    resize: vertical;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #4f3296;
    }
`;

const SubmitButton = styled.button`
    width: 100%;
    padding: 16px;
    background: #4f3296;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #3a2570;
    }
`;

const AutoSaveStatus = styled.div`
    position: fixed;
    bottom: 40px;
    right: 40px;
    padding: 8px 16px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 8px;
    font-size: 14px;
    opacity: ${(props) => (props.visible ? 1 : 0)};
    transition: opacity 0.3s ease;
    z-index: 1000;
`;

export default AddSermonPage;

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { getSermonDetail, updateSermon } from '../services/APIService';
import SermonEditor from './Editor/SermonEditor';

const EditSermonPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        sermonTitle: '',
        sermonDate: '',
        worshipType: '',
        mainScripture: '',
        additionalScripture: '',
        summary: '',
        notes: '',
        recordInfo: '',
        contentText: '',
        public: false,
    });

    useEffect(() => {
        const fetchSermonData = async () => {
            try {
                const data = await getSermonDetail(id);
                setFormData({
                    sermonTitle: data.sermonTitle,
                    sermonDate: new Date(data.sermonDate).toISOString().split('T')[0],
                    worshipType: data.worshipType,
                    mainScripture: data.mainScripture,
                    additionalScripture: data.additionalScripture || '',
                    summary: data.summary,
                    notes: data.notes || '',
                    recordInfo: data.recordInfo || '',
                    contentText: data.contents && data.contents.length > 0 ? data.contents[0].contentText : '',
                    public: data.public,
                });
                setLoading(false);
                window.scrollTo(0, 0);
            } catch (error) {
                console.error('Error fetching sermon data:', error);
                alert('설교 데이터를 불러오는 중 오류가 발생했습니다.');
                navigate(-1);
            }
        };

        fetchSermonData();
    }, [id, navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleEditorChange = (content) => {
        setFormData((prev) => ({
            ...prev,
            contentText: content,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.sermonTitle || !formData.sermonDate || !formData.contentText) {
            alert('제목, 날짜, 내용은 필수 입력사항입니다.');
            return;
        }

        try {
            const userId = localStorage.getItem('UID');
            if (!userId) {
                alert('로그인이 필요합니다.');
                return;
            }

            const cleanContent = formData.contentText.replace(/<span class="ql-cursor">.*?<\/span>/g, '');

            const updatedSermon = {
                sermonDate: formData.sermonDate,
                worshipType: formData.worshipType,
                mainScripture: formData.mainScripture,
                additionalScripture: formData.additionalScripture,
                sermonTitle: formData.sermonTitle,
                summary: formData.summary,
                notes: formData.notes,
                recordInfo: formData.recordInfo,
                contentText: cleanContent,
                public: formData.public,
            };

            await updateSermon(id, userId, updatedSermon);
            alert('설교가 성공적으로 수정되었습니다.');
            navigate(`/main/sermon-list/detail/${id}?type=my`);
        } catch (error) {
            console.error('Error updating sermon:', error);
            alert('설교 수정 중 오류가 발생했습니다.');
        }
    };

    if (loading) {
        return <LoadingText>로딩 중...</LoadingText>;
    }

    return (
        <Container>
            <ContentWrapper>
                <TopBar>
                    <BackButton onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                        <span>뒤로 가기</span>
                    </BackButton>
                </TopBar>
                <FormContainer onSubmit={handleSubmit}>
                    <FormGrid>
                        <FormSection>
                            <Label>설교 날짜</Label>
                            <DateInputWrapper>
                                <CalendarIcon size={20} />
                                <DateInput
                                    type="date"
                                    name="sermonDate"
                                    value={formData.sermonDate}
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
                                value={formData.worshipType}
                                onChange={handleInputChange}
                                placeholder="예) 주일-새벽, 주일오전, 수요저녁, 금요철야"
                                required
                            />
                        </FormSection>
                    </FormGrid>

                    <FormSection>
                        <Label>설교 제목</Label>
                        <Input
                            type="text"
                            name="sermonTitle"
                            value={formData.sermonTitle}
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
                                value={formData.mainScripture}
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
                                value={formData.additionalScripture}
                                onChange={handleInputChange}
                                placeholder="예) 로마서 8:28"
                            />
                        </FormSection>
                    </FormGrid>

                    <FormSection>
                        <Label>설교 요약</Label>
                        <TextArea
                            name="summary"
                            value={formData.summary}
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
                            value={formData.notes}
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
                            value={formData.recordInfo}
                            onChange={handleInputChange}
                            placeholder="예) 234호 308쪽"
                        />
                    </FormSection>

                    <EditorSection>
                        <Label>설교 내용</Label>
                        <SermonEditor ref={editorRef} value={formData.contentText} onChange={handleEditorChange} />
                    </EditorSection>

                    <FormSection>
                        <Label>공개 설정</Label>
                        <CheckboxWrapper>
                            <Checkbox
                                type="checkbox"
                                name="public"
                                checked={formData.public}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        public: e.target.checked,
                                    }))
                                }
                            />
                            <CheckboxLabel>공개 설정</CheckboxLabel>
                        </CheckboxWrapper>
                    </FormSection>

                    <SubmitButton type="submit">수정 완료</SubmitButton>
                </FormContainer>
            </ContentWrapper>
        </Container>
    );
};

const Container = styled.div`
    margin-left: 280px;
    padding: 40px;
    width: calc(100vw - 360px);
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const TopBar = styled.div`
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

    svg {
        transition: transform 0.2s ease;
    }

    &:hover svg {
        transform: translateX(-4px);
    }
`;

const ContentWrapper = styled.div`
    max-width: 800px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    padding: 48px;
    width: 100%;
`;

const FormContainer = styled.form`
    width: 100%;
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-bottom: 32px;
`;

const FormSection = styled.div`
    margin-bottom: 32px;
    padding-right: 35px;

    &:last-child {
        margin-bottom: 0;
    }
`;

const EditorSection = styled.div`
    margin-bottom: 32px;

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

    &:focus {
        outline: none;
        border-color: #4f3296;
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

const CheckboxWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const Checkbox = styled.input`
    width: 20px;
    height: 20px;
    cursor: pointer;
`;

const CheckboxLabel = styled.label`
    font-size: 1rem;
    color: #333;
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

const LoadingText = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.2rem;
    color: #666;
`;

export default EditSermonPage;

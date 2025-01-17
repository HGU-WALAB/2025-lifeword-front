import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getSermonDetail, updateSermon } from '../services/APIService';
import { ArrowLeft } from 'lucide-react';

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
        fileCode: '',
        public: false,
    });
    const [content, setContent] = useState('');

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
                    fileCode: data.fileCode,
                    public: data.public,
                });
                setContent(data.contents[0]?.contentText || '');
                setLoading(false);
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

    const handleEditorChange = (value) => {
        setContent(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.sermonTitle.trim()) {
            alert('설교 제목을 입력해주세요.');
            return;
        }

        if (!formData.sermonDate) {
            alert('설교 날짜를 선택해주세요.');
            return;
        }

        if (!formData.worshipType.trim()) {
            alert('예배 종류를 입력해주세요.');
            return;
        }

        if (!formData.mainScripture.trim()) {
            alert('주 성경 구절을 입력해주세요.');
            return;
        }

        if (!formData.summary.trim()) {
            alert('설교 요약을 입력해주세요.');
            return;
        }

        if (!content.trim()) {
            alert('설교 내용을 입력해주세요.');
            return;
        }

        try {
            const userId = localStorage.getItem('UID');
            const updatedSermon = {
                ...formData,
                contents: [{ contentText: content }],
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
                <Header>
                    <BackButton onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                        <span>뒤로 가기</span>
                    </BackButton>
                </Header>

                <FormContainer onSubmit={handleSubmit}>
                    <FormGrid>
                        <FormSection>
                            <Label htmlFor="sermonTitle">설교 제목</Label>
                            <Input
                                type="text"
                                id="sermonTitle"
                                name="sermonTitle"
                                value={formData.sermonTitle}
                                onChange={handleInputChange}
                                placeholder="설교 제목을 입력하세요"
                            />
                        </FormSection>

                        <FormSection>
                            <Label htmlFor="sermonDate">설교 날짜</Label>
                            <Input
                                type="date"
                                id="sermonDate"
                                name="sermonDate"
                                value={formData.sermonDate}
                                onChange={handleInputChange}
                            />
                        </FormSection>

                        <FormSection>
                            <Label htmlFor="worshipType">예배 종류</Label>
                            <Input
                                type="text"
                                id="worshipType"
                                name="worshipType"
                                value={formData.worshipType}
                                onChange={handleInputChange}
                                placeholder="예) 주일예배, 수요예배"
                            />
                        </FormSection>

                        <FormSection>
                            <Label htmlFor="mainScripture">주 성경 구절</Label>
                            <Input
                                type="text"
                                id="mainScripture"
                                name="mainScripture"
                                value={formData.mainScripture}
                                onChange={handleInputChange}
                                placeholder="예) 창세기 1:1-10"
                            />
                        </FormSection>

                        <FormSection>
                            <Label htmlFor="additionalScripture">추가 성경 구절</Label>
                            <Input
                                type="text"
                                id="additionalScripture"
                                name="additionalScripture"
                                value={formData.additionalScripture}
                                onChange={handleInputChange}
                                placeholder="예) 요한복음 3:16"
                            />
                        </FormSection>

                        <FormSection>
                            <Label htmlFor="fileCode">파일 코드</Label>
                            <Input
                                type="text"
                                id="fileCode"
                                name="fileCode"
                                value={formData.fileCode}
                                onChange={handleInputChange}
                                placeholder="파일 코드를 입력하세요"
                            />
                        </FormSection>
                    </FormGrid>

                    <FormSection>
                        <Label htmlFor="summary">설교 요약</Label>
                        <TextArea
                            id="summary"
                            name="summary"
                            value={formData.summary}
                            onChange={handleInputChange}
                            placeholder="설교 내용을 간단히 요약해주세요"
                            rows={4}
                        />
                    </FormSection>

                    <FormSection>
                        <Label htmlFor="notes">노트</Label>
                        <TextArea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="추가 노트가 있다면 입력해주세요"
                            rows={4}
                        />
                    </FormSection>

                    <FormSection>
                        <Label htmlFor="recordInfo">설교록 정보</Label>
                        <TextArea
                            id="recordInfo"
                            name="recordInfo"
                            value={formData.recordInfo}
                            onChange={handleInputChange}
                            placeholder="설교록에 대한 추가 정보가 있다면 입력해주세요"
                            rows={4}
                        />
                    </FormSection>

                    <EditorSection>
                        <Label>설교 내용</Label>
                        <EditorContainer>
                            <ReactQuill
                                ref={editorRef}
                                value={content}
                                onChange={handleEditorChange}
                                modules={{
                                    toolbar: [
                                        [{ header: [1, 2, 3, false] }],
                                        [{ font: [] }],
                                        [{ size: [] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{ color: [] }, { background: [] }],
                                        [{ list: 'ordered' }, { list: 'bullet' }],
                                        [{ indent: '-1' }, { indent: '+1' }],
                                        [{ align: [] }],
                                        ['link'],
                                        ['clean'],
                                    ],
                                }}
                            />
                        </EditorContainer>
                    </EditorSection>

                    <FormSection>
                        <CheckboxContainer>
                            <CheckboxInput
                                type="checkbox"
                                id="public"
                                name="public"
                                checked={formData.public}
                                onChange={handleInputChange}
                            />
                            <CheckboxLabel htmlFor="public">공개 설교로 설정</CheckboxLabel>
                        </CheckboxContainer>
                    </FormSection>

                    <ButtonContainer>
                        <CancelButton type="button" onClick={() => navigate(-1)}>
                            취소
                        </CancelButton>
                        <SubmitButton type="submit">수정 완료</SubmitButton>
                    </ButtonContainer>
                </FormContainer>
            </ContentWrapper>
        </Container>
    );
};

const Container = styled.div`
    margin-left: 320px;
    padding: 40px;
    width: calc(100vw - 360px);
    min-height: 91vh;
    background-color: #f5f5f5;
    overflow-y: auto;

    @media (max-width: 1024px) {
        margin-left: 280px;
        width: calc(100vw - 320px);
        padding: 32px;
    }

    @media (max-width: 768px) {
        margin-left: 0;
        width: 100%;
        padding: 24px;
    }
`;

const ContentWrapper = styled.div`
    max-width: 800px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    padding: 48px;

    @media (max-width: 1024px) {
        padding: 32px;
    }

    @media (max-width: 768px) {
        padding: 24px;
        margin: 0;
        border-radius: 8px;
    }

    @media (max-width: 480px) {
        padding: 16px;
    }
`;

const Header = styled.div`
    margin-bottom: 48px;
    border-bottom: 2px solid #f3f4f6;
    padding-bottom: 24px;
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
    margin-bottom: 24px;
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

const TextArea = styled.textarea`
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #eee;
    border-radius: 8px;
    font-size: 1rem;
    resize: vertical;
    min-height: 100px;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #4f3296;
    }
`;

const EditorContainer = styled.div`
    .ql-container {
        height: 400px;
        font-size: 1rem;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
    }

    .ql-toolbar {
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
    }

    .ql-editor {
        padding: 16px;
    }
`;

const CheckboxContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const CheckboxInput = styled.input`
    width: 20px;
    height: 20px;
    cursor: pointer;
`;

const CheckboxLabel = styled.label`
    color: #333;
    font-weight: 500;
    cursor: pointer;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-top: 32px;
`;

const Button = styled.button`
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
`;

const SubmitButton = styled(Button)`
    background-color: #4f3296;
    color: white;
    border: none;

    &:hover {
        background-color: #3a2570;
    }
`;

const CancelButton = styled(Button)`
    background-color: white;
    color: #4f3296;
    border: 2px solid #4f3296;

    &:hover {
        background-color: #f8f5ff;
    }
`;

const LoadingText = styled.div`
    text-align: center;
    padding: 40px;
    color: #666;
    font-size: 1.1rem;
`;

export default EditSermonPage;

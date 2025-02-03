import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Unlock, Lock } from 'lucide-react';
import { getSermonDetail, updateSermon } from '../../services/APIService';
import SermonEditor from '../Editor/SermonEditor';
import { useUserState, useOriginalUserId } from '../../recoil/utils';

const WORSHIP_TYPES = [
    '새벽예배',
    '수요예배',
    '금요성령집회',
    '주일1부예배',
    '주일2부예배',
    '주일3부예배',
    '주일청년예배',
    '주일오후예배',
    '특별집회',
    '부흥회',
    '기타',
];

const EditSermonPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const originalUserId = searchParams.get('originalUserId');
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const { userId } = useUserState();

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
        userId: '',
    });

    const [showAdditionalScripture, setShowAdditionalScripture] = useState(false);
    const [isMetaSectionOpen, setIsMetaSectionOpen] = useState(true);
    const [autoSaveStatus, setAutoSaveStatus] = useState('');

    // 현재 경로가 admin인지 확인
    const isAdminPage = window.location.pathname.includes('/admin/sermons');

    useEffect(() => {
        const fetchSermonData = async () => {
            try {
                const data = await getSermonDetail(id);
                setFormData({
                    ...data,
                    userId: data.userId,
                    sermonDate: new Date(data.sermonDate).toISOString().split('T')[0],
                    contentText: data.contents && data.contents.length > 0 ? data.contents[0].contentText : '',
                });
                if (data.additionalScripture) {
                    setShowAdditionalScripture(true);
                }
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

    useEffect(() => {
        const autoSaveTimer = setTimeout(() => {
            if (formData.contentText) {
                localStorage.setItem('sermon_draft', JSON.stringify(formData));
                setAutoSaveStatus('임시저장됨');

                setTimeout(() => setAutoSaveStatus(''), 2000);
            }
        }, 30000);

        return () => clearTimeout(autoSaveTimer);
    }, [formData]);

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
            const cleanContent = formData.contentText.replace(/<span class="ql-cursor">.*?<\/span>/g, '');
            const updatedSermon = {
                sermonDate: formData.sermonDate,
                worshipType: formData.worshipType === '기타' ? formData.customWorshipType : formData.worshipType,
                mainScripture: formData.mainScripture,
                additionalScripture: formData.additionalScripture,
                sermonTitle: formData.sermonTitle,
                summary: formData.summary,
                notes: formData.notes,
                recordInfo: formData.recordInfo,
                contentText: cleanContent,
                public: formData.public,
            };

            // 관리자 페이지에서 수정할 때는 해당 설교의 원래 userId를 사용
            const targetUserId = isAdminPage ? formData.userId : userId;
            await updateSermon(id, targetUserId, updatedSermon);

            alert('설교가 성공적으로 수정되었습니다.');

            // 관리자 페이지에서 왔으면 관리자 목록으로, 아니면 일반 목록으로
            navigate(isAdminPage ? '/main/admin/sermons' : '/main/sermon-list');
        } catch (error) {
            console.error('Error updating sermon:', error);
            alert('설교 수정 중 오류가 발생했습니다.');
        }
    };

    const toggleMetaSection = () => {
        setIsMetaSectionOpen(!isMetaSectionOpen);
    };

    if (loading) {
        return <LoadingText>로딩 중...</LoadingText>;
    }

    return (
        <Container>
            <PageHeader>
                <Title>설교 수정하기</Title>
                <Description>설교 내용을 수정해보세요.</Description>
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
                                    value={formData.sermonDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </DateInputWrapper>
                        </FormSection>

                        <FormSection>
                            <Label>예배 종류</Label>
                            <Select
                                name="worshipType"
                                value={formData.worshipType}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">예배 종류 선택</option>
                                {WORSHIP_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </Select>
                            {formData.worshipType === '기타' && (
                                <CustomInputWrapper>
                                    <Input
                                        type="text"
                                        name="customWorshipType"
                                        value={formData.customWorshipType}
                                        onChange={handleInputChange}
                                        placeholder="예배 종류를 직접 입력하세요"
                                        required
                                    />
                                </CustomInputWrapper>
                            )}
                        </FormSection>

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

                        <FormSection>
                            <ScriptureHeader>
                                <Label>성경 본문</Label>
                                {!showAdditionalScripture && (
                                    <AddScriptureButton type="button" onClick={() => setShowAdditionalScripture(true)}>
                                        <Plus size={16} />
                                        추가
                                    </AddScriptureButton>
                                )}
                            </ScriptureHeader>
                            <ScriptureContainer>
                                <Input
                                    type="text"
                                    name="mainScripture"
                                    value={formData.mainScripture}
                                    onChange={handleInputChange}
                                    placeholder="예) 요한복음 3:16"
                                    required
                                />
                                {showAdditionalScripture && (
                                    <AdditionalScriptureWrapper>
                                        <Input
                                            type="text"
                                            name="additionalScripture"
                                            value={formData.additionalScripture}
                                            onChange={handleInputChange}
                                            placeholder="예) 로마서 8:28"
                                        />
                                        <RemoveScriptureButton
                                            type="button"
                                            onClick={() => {
                                                setShowAdditionalScripture(false);
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    additionalScripture: '',
                                                }));
                                            }}
                                        >
                                            <X size={16} />
                                        </RemoveScriptureButton>
                                    </AdditionalScriptureWrapper>
                                )}
                            </ScriptureContainer>
                        </FormSection>

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
                            <Label>공개 설정</Label>
                            <PrivacyToggle>
                                <ToggleSwitch>
                                    <input
                                        type="checkbox"
                                        checked={formData.public}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                public: e.target.checked,
                                            }))
                                        }
                                    />
                                    <span />
                                </ToggleSwitch>
                                <PrivacyLabel>
                                    {formData.public ? (
                                        <>
                                            <Unlock size={16} />
                                            전체 공개
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={16} />
                                            비공개
                                        </>
                                    )}
                                </PrivacyLabel>
                            </PrivacyToggle>
                        </FormSection>

                        <SubmitButton type="submit">수정 완료</SubmitButton>
                    </MetaSection>
                </MetaSectionWrapper>

                <EditorContainer className="editor-container" isMetaOpen={isMetaSectionOpen}>
                    <Label>설교 내용</Label>
                    <SermonEditor ref={editorRef} value={formData.contentText} onChange={handleEditorChange} />
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

const EditorContainer = styled.div`
    background: white;
    padding: 32px;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    min-height: 600px;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 40px;
`;

const FormSection = styled.div`
    margin-bottom: 32px;
    padding-right: 35px;

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

const Title = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 16px;
`;

const Description = styled.p`
    font-size: 1.2rem;
    color: #666;
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

const Select = styled.select`
    width: 100%;
    padding: 12px;
    border: 2px solid #eee;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #4f3296;
    }
`;

const CustomInputWrapper = styled.div`
    margin-top: 16px;
`;

const AddScriptureButton = styled.button`
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

const ScriptureHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

const ScriptureContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const AdditionalScriptureWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const RemoveScriptureButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: none;
    background: none;
    color: #666;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        color: #ff4444;
    }
`;

const PrivacyToggle = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const ToggleSwitch = styled.label`
    position: relative;
    display: inline-block;
    width: 48px;
    height: 24px;

    input {
        opacity: 0;
        width: 0;
        height: 0;

        &:checked + span {
            background-color: #4f3296;
        }

        &:checked + span:before {
            transform: translateX(24px);
        }
    }

    span {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.4s;
        border-radius: 34px;

        &:before {
            position: absolute;
            content: '';
            height: 20px;
            width: 20px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: 0.4s;
            border-radius: 50%;
        }
    }
`;

const PrivacyLabel = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    color: #666;
    font-size: 0.9rem;

    svg {
        color: #4f3296;
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

export default EditSermonPage;

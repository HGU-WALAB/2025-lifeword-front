import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Lock, Unlock } from 'lucide-react';
import { createSermon } from '../../services/APIService';
import SermonEditor from '../Editor/SermonEditor';
import { useUserState } from '../../recoil/utils';

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

const AddSermonPage = () => {
    const navigate = useNavigate();
    const { userId } = useUserState();
    const [sermonData, setSermonData] = useState({
        sermonDate: '',
        worshipType: '',
        customWorshipType: '',
        mainScripture: '',
        additionalScripture: '',
        sermonTitle: '',
        summary: '',
        notes: '',
        contentText: '',
        public: true,
    });
    const editorRef = useRef(null);
    const [autoSaveStatus, setAutoSaveStatus] = useState('');
    const [isMetaSectionOpen, setIsMetaSectionOpen] = useState(true);
    const [showAdditionalScripture, setShowAdditionalScripture] = useState(false);

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

        // 예배 종류가 변경될 때
        if (name === 'worshipType') {
            setSermonData((prev) => ({
                ...prev,
                worshipType: value,
                // 기타가 아닐 때는 customWorshipType 초기화
                ...(value !== '기타' && { customWorshipType: '' }),
            }));
        }
        // 기타 예배 종류를 직접 입력할 때
        else if (name === 'customWorshipType') {
            setSermonData((prev) => ({
                ...prev,
                customWorshipType: value,
                worshipType: '기타',
            }));
        }
        // 다른 필드들의 변경
        else {
            setSermonData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
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
                // 예배 종류가 '기타'일 경우 customWorshipType을 사용
                worshipType: sermonData.worshipType === '기타' ? sermonData.customWorshipType : sermonData.worshipType,
                contentText: cleanContent,
                userId,
                createdAt: new Date().toISOString(),
            };

            delete submitData.customWorshipType;

            const response = await createSermon(submitData);

            if (response && response.sermonId) {
                alert('설교가 성공적으로 등록되었습니다.');
                localStorage.removeItem('sermon_draft');
                navigate('/main/sermon-list');
            } else {
                throw new Error('설교 등록에 실패했습니다.');
            }
        } catch (error) {
            alert(`설교 등록 중 오류가 발생했습니다: ${error.message}`);
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
                            <Select
                                name="worshipType"
                                value={sermonData.worshipType}
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
                            {sermonData.worshipType === '기타' && (
                                <CustomInputWrapper>
                                    <Input
                                        type="text"
                                        name="customWorshipType"
                                        value={sermonData.customWorshipType}
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
                                value={sermonData.sermonTitle}
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
                                    value={sermonData.mainScripture}
                                    onChange={handleInputChange}
                                    placeholder="예) 요한복음 3:16"
                                    required
                                />
                                {showAdditionalScripture && (
                                    <AdditionalScriptureWrapper>
                                        <Input
                                            type="text"
                                            name="additionalScripture"
                                            value={sermonData.additionalScripture}
                                            onChange={handleInputChange}
                                            placeholder="예) 로마서 8:28"
                                        />
                                        <RemoveScriptureButton
                                            type="button"
                                            onClick={() => {
                                                setShowAdditionalScripture(false);
                                                setSermonData((prev) => ({
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
                            <Label>공개 설정</Label>
                            <PrivacyToggle>
                                <ToggleSwitch>
                                    <input
                                        type="checkbox"
                                        checked={sermonData.public}
                                        onChange={(e) =>
                                            setSermonData((prev) => ({
                                                ...prev,
                                                public: e.target.checked,
                                            }))
                                        }
                                    />
                                    <span />
                                </ToggleSwitch>
                                <PrivacyLabel>
                                    {sermonData.public ? (
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
    padding: 40px;
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
    min-height: 600px;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 40px;
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
    width: 90%;
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
    width: 90%;
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

const Select = styled.select`
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #eee;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s ease;
    background-color: white;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: #4f3296;
        box-shadow: 0 0 0 3px rgba(79, 50, 150, 0.1);
    }
`;

const ScriptureHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
`;

const AddScriptureButton = styled.button`
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border: none;
    background: none;
    color: #4f3296;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        color: #3a2570;
    }
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

const CustomInputWrapper = styled.div`
    margin-top: 8px;
    animation: slideDown 0.3s ease;

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
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

export default AddSermonPage;

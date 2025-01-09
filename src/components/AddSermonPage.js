import React, { useState } from 'react';
import styled from 'styled-components';
import { Calendar as CalendarIcon } from 'lucide-react';
import { createSermon } from '../services/APIService';

const AddSermonPage = () => {
    const [owner, setOwner] = useState('');
    const [title, setTitle] = useState('');
    const [sermonDate, setSermonDate] = useState('');
    const [sermonContent, setSermonContent] = useState('');
    const [currentTag, setCurrentTag] = useState('');
    const [tags, setTags] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const sermonData = {
                owner,
                title,
                sermonDate,
                sermonContent,
                keywords: tags,
            };

            const response = await createSermon(sermonData);
            if (response.success) {
                alert('설교가 성공적으로 등록되었습니다.');
                setOwner('');
                setTitle('');
                setSermonDate('');
                setSermonContent('');
                setTags([]);
            }
        } catch (error) {
            console.error('Error creating sermon:', error);
            alert('설교 등록에 실패했습니다.');
        }
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (currentTag.trim().length > 0) {
                setCurrentTag(currentTag.trim() + ' ');
                setTimeout(() => {
                    const newTag = currentTag.trim().split(' ')[0];
                    if (!tags.includes(newTag)) {
                        setTags([...tags, newTag]);
                    }
                    setCurrentTag('');
                }, 10);
            }
        } else if (e.key === 'Backspace' && currentTag === '' && tags.length > 0) {
            e.preventDefault();
            setTags(tags.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleTagChange = (e) => {
        setCurrentTag(e.target.value.replace(/^#/, ''));
    };

    return (
        <Container>
            <PageHeader>
                <Title>설교 추가하기</Title>
                <Description>새로운 설교를 등록해보세요.</Description>
            </PageHeader>

            <FormContainer onSubmit={handleSubmit}>
                <FormGrid>
                    <FormSection>
                        <Label>설교자</Label>
                        <Input
                            type="text"
                            value={owner}
                            onChange={(e) => setOwner(e.target.value)}
                            placeholder="설교자 이름을 입력하세요"
                            required
                        />
                    </FormSection>

                    <FormSection>
                        <Label>설교 날짜</Label>
                        <DateInputWrapper>
                            <CalendarIcon size={20} />
                            <DateInput
                                type="date"
                                value={sermonDate}
                                onChange={(e) => setSermonDate(e.target.value)}
                                required
                            />
                        </DateInputWrapper>
                    </FormSection>
                </FormGrid>

                <FormSection>
                    <Label>설교 제목</Label>
                    <Input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="설교 제목을 입력하세요"
                        required
                    />
                </FormSection>

                <FormSection>
                    <Label>설교 내용</Label>
                    <TextArea
                        value={sermonContent}
                        onChange={(e) => setSermonContent(e.target.value)}
                        placeholder="설교 내용을 입력하세요"
                        required
                    />
                </FormSection>

                <FormSection>
                    <Label>키워드</Label>
                    <TagsContainer>
                        {tags.map((tag, index) => (
                            <Tag key={index}>
                                #{tag}
                                <RemoveTag onClick={() => removeTag(tag)}>×</RemoveTag>
                            </Tag>
                        ))}
                        <TagInput
                            value={currentTag}
                            onChange={handleTagChange}
                            onKeyDown={handleTagKeyDown}
                            placeholder="키워드를 입력하고 Enter를 누르세요"
                        />
                    </TagsContainer>
                    <TagHelper>Enter로 키워드 추가, Backspace로 삭제</TagHelper>
                </FormSection>

                <SubmitButton type="submit">설교 등록하기</SubmitButton>
            </FormContainer>
        </Container>
    );
};

const Container = styled.div`
    margin-left: 280px;
    padding: 40px 60px;
    width: calc(100vw - 280px);
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const PageHeader = styled.div`
    margin-bottom: 40px;
    width: 100%;
    max-width: 800px;
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
    background: white;
    padding: 48px;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    width: 100%;
    max-width: 800px;
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-bottom: 32px;
`;

const FormSection = styled.div`
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
    height: 300px;
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

const TagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px;
    border: 2px solid #eee;
    border-radius: 8px;
    min-height: 48px;
    align-items: center;

    &:focus-within {
        border-color: #4f3296;
    }
`;

const Tag = styled.span`
    display: inline-flex;
    align-items: center;
    background: #4f3296;
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
`;

const RemoveTag = styled.span`
    margin-left: 6px;
    width: 18px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    cursor: pointer;
    font-size: 14px;

    &:hover {
        background: rgba(255, 255, 255, 0.4);
    }
`;

const TagHelper = styled.p`
    margin-top: 8px;
    color: #666;
    font-size: 0.8rem;
    font-style: italic;
`;

const TagInput = styled.input`
    border: none;
    outline: none;
    padding: 4px 8px;
    flex: 1;
    min-width: 120px;
    font-size: 0.9rem;

    &::placeholder {
        color: #aaa;
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

export default AddSermonPage;

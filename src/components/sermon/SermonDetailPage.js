import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getSermonDetail, deleteSermon } from '../../services/APIService';
import {
    ArrowLeft,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronUp,
    Lock,
    Unlock,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useUserState } from '../../recoil/utils';
import { useRecoilValue } from 'recoil';
import { isNavExpandedState } from '../../recoil/atoms';

const SermonDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sermon, setSermon] = useState(null);
    const [loading, setLoading] = useState(true);
    const { userId: currentUserId, isAdmin } = useUserState();
    const currentPath = window.location.pathname;
    const isAdminPage = currentPath.includes('/admin/sermons');
    const [isMetaSectionOpen, setIsMetaSectionOpen] = useState(true);
    const isExpanded = useRecoilValue(isNavExpandedState);
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        const fetchSermonDetail = async () => {
            try {
                const data = await getSermonDetail(id);
                setSermon(data);
            } catch (error) {
                console.error('Error fetching sermon detail:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSermonDetail();
        }
    }, [id]);

    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleDelete = async () => {
        if (window.confirm('정말로 이 설교를 삭제하시겠습니까?')) {
            try {
                const targetUserId = isAdminPage ? sermon.userId : currentUserId;
                await deleteSermon(id, targetUserId);
                alert('설교가 삭제되었습니다.');
                navigate(-1);
            } catch (error) {
                console.error('Error deleting sermon:', error);
                alert('설교 삭제 중 오류가 발생했습니다.');
            }
        }
    };

    const handleEdit = () => {
        if (currentPath.includes('/admin/sermons')) {
            navigate(`/main/admin/sermons/edit/${id}`);
        } else {
            navigate(`/main/sermon-list/edit/${id}`);
        }
    };

    if (loading) {
        return <LoadingText>로딩 중...</LoadingText>;
    }

    if (!sermon) {
        return <EmptyText>설교를 찾을 수 없습니다.</EmptyText>;
    }

    return (
        <Container isExpanded={isExpanded}>

            <FormContainer isMetaOpen={isMetaSectionOpen}>
                <MetaSectionWrapper isOpen={isMetaSectionOpen}>
                    <ToggleButton onClick={() => setIsMetaSectionOpen(!isMetaSectionOpen)} type="button">
                        {isMetaSectionOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </ToggleButton>
                    <MetaSection isOpen={isMetaSectionOpen}>

                        <BackButton onClick={() => navigate(-1)}>
                            <ArrowLeft size={20} />
                            <span>뒤로 가기</span>
                        </BackButton>
                        {(sermon?.userId === currentUserId || (isAdmin && isAdminPage)) && (
                            <ActionButtons>
                                <ActionButton onClick={handleEdit}>
                                    <Pencil size={16} />
                                </ActionButton>
                                <ActionButton onClick={handleDelete} isDelete>
                                    <Trash2 size={16} />
                                </ActionButton>
                            </ActionButtons>
                        )}
                        <FormSection>
                            <Label>작성자</Label>
                            <AuthorInfo>
                                <Author>{sermon.ownerName}</Author>
                                <DateInfo>
                                    <SermonDate>
                                        {new Date(sermon.sermonDate).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </SermonDate>
                                    <CreatedDate>
                                        작성일:{' '}
                                        {new Date(sermon.createdAt).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </CreatedDate>
                                </DateInfo>
                            </AuthorInfo>
                        </FormSection>

                        <FormSection>
                            <Label>예배 종류</Label>
                            <Badge>{sermon.worshipType}</Badge>
                        </FormSection>

                        <FormSection>
                            <Label>설교 제목</Label>
                            <Title>{sermon.sermonTitle}</Title>
                        </FormSection>

                        <FormSection>
                            <Label>성경 구절</Label>
                            <ScriptureContainer>
                                <Scripture>{sermon.mainScripture}</Scripture>
                                {sermon.additionalScripture && <Scripture>{sermon.additionalScripture}</Scripture>}
                            </ScriptureContainer>
                        </FormSection>

                        <FormSection>
                            <Label>설교 요약</Label>
                            <Summary>{sermon.summary}</Summary>
                        </FormSection>

                        {sermon.notes && (
                            <FormSection>
                                <Label>노트</Label>
                                <Notes>{sermon.notes}</Notes>
                            </FormSection>
                        )}

                        <FormSection>
                            <Label>공개 설정</Label>
                            <PrivacyStatus>
                                {sermon.public ? (
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
                            </PrivacyStatus>
                        </FormSection>
                    </MetaSection>
                </MetaSectionWrapper>

                <ContentSection className="editor-container" isMetaOpen={isMetaSectionOpen}>
                    <Label>설교 내용</Label>
                    <Content dangerouslySetInnerHTML={{ __html: sermon.contents[0]?.contentText || '' }} />
                </ContentSection>
            </FormContainer>
        </Container>
    );
};

const Container = styled.div`
  padding: 40px;
    width: 100vw;
    background-color: #f5f5f5;
    min-height: 100vh;
    transition: all 0.3s ease;
`;

const ExpandableHeader = styled.div`
    position: sticky;
    top: 0;
    width: 100%;
    z-index: 100;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    height: 60px; /* Collapsed */
    transition: height 0.3s ease;
  margin-bottom: 24px;

    &:hover {
        height: 200px;
      
    }
`;

const ExpandedContent = styled.div`
    padding: 16px;
    opacity: 0;
    transition: opacity 0.3s ease;

    ${ExpandableHeader}:hover & {
        opacity: 1;
    }
`;

const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
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

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
`;

const ActionButton = styled.button`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: ${(props) => (props.isDelete ? '#fee2e2' : '#f3f4f6')};
    color: ${(props) => (props.isDelete ? '#dc2626' : '#4f3296')};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${(props) => (props.isDelete ? '#fecaca' : '#e5e7eb')};
        color: ${(props) => (props.isDelete ? '#b91c1c' : '#3a2570')};
    }
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

const FormContainer = styled.div`
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

const ContentSection = styled.div`
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
    margin-bottom: 24px;
`;

const Label = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #4f3296;
    margin-bottom: 8px;
`;

const AuthorInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Author = styled.span`
    font-size: 16px;
    color: #4f3296;
    font-weight: 600;
`;

const DateInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const SermonDate = styled.span`
    font-size: 14px;
    color: #595c62;
    font-weight: 500;
`;

const CreatedDate = styled.span`
    font-size: 12px;
    color: #888;
`;

const Badge = styled.span`
    padding: 8px 16px;
    background: #f3f4f6;
    border-radius: 20px;
    font-size: 14px;
    color: #4f3296;
    font-weight: 500;
`;

const ScriptureContainer = styled.div`
    display: flex;
    gap: 16px;
    font-size: 16px;
    color: #212a3e;

    @media (max-width: 480px) {
        flex-direction: column;
        gap: 8px;
    }
`;

const Scripture = styled.span`
    font-weight: 500;
`;

const Summary = styled.p`
    font-size: 16px;
    line-height: 1.8;
    color: #4b5563;
    white-space: pre-wrap;
    background: #f8f9fa;
    padding: 24px;
    border-radius: 8px;
`;

const Notes = styled(Summary)`
    white-space: pre-wrap;
`;

const PrivacyStatus = styled.span`
    padding: 8px 16px;
    background: #f3f4f6;
    border-radius: 20px;
    font-size: 14px;
    color: #4f3296;
    font-weight: 500;
`;

const Content = styled.div`
    font-size: 16px;
    line-height: 1.8;
    color: #333;

    /* Headers */
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        margin: 1.5em 0 0.5em;
        color: #212a3e;
        font-weight: 600;
        line-height: 1.3;
    }

    h1 {
        font-size: 2em;
    }
    h2 {
        font-size: 1.75em;
    }
    h3 {
        font-size: 1.5em;
    }
    h4 {
        font-size: 1.25em;
    }
    h5 {
        font-size: 1.1em;
    }
    h6 {
        font-size: 1em;
    }

    /* Paragraph and basic elements */
    p {
        margin: 1em 0;
        line-height: 1.8;
    }

    /* Lists */
    ul,
    ol {
        padding-left: 1.5em;
        margin: 1em 0;
    }

    li {
        margin: 0.5em 0;
    }

    /* Blockquotes */
    blockquote {
        border-left: 4px solid #4f3296;
        margin: 1.5em 0;
        padding: 1em 1.5em;
        background: #f8f9fa;
        color: #666;
        font-style: italic;
    }

    /* Images */
    img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 1em 0;
    }

    /* Links */
    a {
        color: #4f3296;
        text-decoration: none;
        &:hover {
            text-decoration: underline;
        }
    }

    /* Code blocks */
    pre {
        background: #f8f9fa;
        padding: 1em;
        border-radius: 8px;
        overflow-x: auto;
        margin: 1em 0;
    }

    code {
        background: #f3f4f6;
        padding: 0.2em 0.4em;
        border-radius: 4px;
        font-size: 0.9em;
    }

    /* Font families */
    .ql-font-noto-sans-kr {
        font-family: 'Noto Sans KR', sans-serif;
    }
    .ql-font-nanum-gothic {
        font-family: 'Nanum Gothic', sans-serif;
    }
    .ql-font-nanum-myeongjo {
        font-family: 'Nanum Myeongjo', serif;
    }
    .ql-font-nanum-pen-script {
        font-family: 'Nanum Pen Script', cursive;
    }
    .ql-font-poor-story {
        font-family: 'Poor Story', cursive;
    }
    .ql-font-jua {
        font-family: 'Jua', sans-serif;
    }

    /* Font sizes */
    .ql-size-8px {
        font-size: 8px;
    }
    .ql-size-9px {
        font-size: 9px;
    }
    .ql-size-10px {
        font-size: 10px;
    }
    .ql-size-11px {
        font-size: 11px;
    }
    .ql-size-12px {
        font-size: 12px;
    }
    .ql-size-14px {
        font-size: 14px;
    }
    .ql-size-16px {
        font-size: 16px;
    }
    .ql-size-18px {
        font-size: 18px;
    }
    .ql-size-24px {
        font-size: 24px;
    }
    .ql-size-36px {
        font-size: 36px;
    }
    .ql-size-48px {
        font-size: 48px;
    }
    .ql-size-72px {
        font-size: 72px;
    }
    .ql-size-96px {
        font-size: 96px;
    }

    /* Text alignments */
    .ql-align-center {
        text-align: center;
    }
    .ql-align-right {
        text-align: right;
    }
    .ql-align-justify {
        text-align: justify;
    }

    /* Text styles */
    strong {
        font-weight: bold;
    }
    em {
        font-style: italic;
    }
    u {
        text-decoration: underline;
    }
    s {
        text-decoration: line-through;
    }

    /* Indent */
    .ql-indent-1 {
        padding-left: 3em;
    }
    .ql-indent-2 {
        padding-left: 6em;
    }
    .ql-indent-3 {
        padding-left: 9em;
    }
    .ql-indent-4 {
        padding-left: 12em;
    }
    .ql-indent-5 {
        padding-left: 15em;
    }
    .ql-indent-6 {
        padding-left: 18em;
    }
    .ql-indent-7 {
        padding-left: 21em;
    }
    .ql-indent-8 {
        padding-left: 24em;
    }

    /* Lists */
    .ql-list-ordered {
        list-style-type: decimal;
    }
    .ql-list-bullet {
        list-style-type: disc;
    }

    /* Background and text colors */
    [class^='ql-bg-'] {
        padding: 0 2px;
    }
    [class^='ql-color-'] {
        padding: 0 2px;
    }

    @media (max-width: 768px) {
        font-size: 14px;

        h1 {
            font-size: 1.75em;
        }
        h2 {
            font-size: 1.5em;
        }
        h3 {
            font-size: 1.25em;
        }
        h4 {
            font-size: 1.1em;
        }
        h5,
        h6 {
            font-size: 1em;
        }

        blockquote {
            padding: 0.75em 1em;
        }

        .ql-indent-1 {
            padding-left: 2em;
        }
        .ql-indent-2 {
            padding-left: 4em;
        }
        .ql-indent-3 {
            padding-left: 6em;
        }
        .ql-indent-4 {
            padding-left: 8em;
        }
        .ql-indent-5 {
            padding-left: 10em;
        }
        .ql-indent-6 {
            padding-left: 12em;
        }
        .ql-indent-7 {
            padding-left: 14em;
        }
        .ql-indent-8 {
            padding-left: 16em;
        }
    }
`;

const LoadingText = styled.div`
    text-align: center;
    padding: 40px;
    color: #666;
    font-size: 16px;
`;

const EmptyText = styled(LoadingText)`
    color: #999;
`;

export default SermonDetailPage;

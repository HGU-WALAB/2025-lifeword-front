import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getSermonDetail, deleteSermon } from '../../services/APIService';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

const SermonDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sermon, setSermon] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentUserId = localStorage.getItem('UID');
    const isAdmin = localStorage.getItem('admin') === 'true';
    const currentPath = window.location.pathname;
    const isAdminPage = currentPath.includes('/admin/sermons');

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
        if (isAdminPage) {
            localStorage.setItem('originalUserId', sermon.userId);
        }

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
        <Container>
            <ContentWrapper>
                <Header>
                    <TopBar>
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
                    </TopBar>
                    <MetaInfo>
                        <AuthorDate>
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
                        </AuthorDate>
                        <Badge>{sermon.worshipType}</Badge>
                    </MetaInfo>
                    <Title>{sermon.sermonTitle}</Title>
                    <Scripture>
                        <MainScripture>{sermon.mainScripture}</MainScripture>
                        {sermon.additionalScripture && (
                            <AdditionalScripture>{sermon.additionalScripture}</AdditionalScripture>
                        )}
                    </Scripture>
                </Header>

                <Section>
                    <SectionTitle>요약</SectionTitle>
                    <SummaryText>{sermon.summary}</SummaryText>
                </Section>

                {sermon.notes && (
                    <Section>
                        <SectionTitle>노트</SectionTitle>
                        <NotesText>{sermon.notes}</NotesText>
                    </Section>
                )}

                {sermon.recordInfo && (
                    <Section>
                        <SectionTitle>설교록 정보</SectionTitle>
                        <RecordInfo>{sermon.recordInfo}</RecordInfo>
                    </Section>
                )}

                <Section>
                    <SectionTitle>설교 내용</SectionTitle>
                    <ContentView
                        dangerouslySetInnerHTML={{
                            __html: sermon.contents[0]?.contentText || '',
                        }}
                    />
                </Section>

                <MetaSection>
                    <MetaItem>
                        <MetaLabel>파일 코드</MetaLabel>
                        <MetaValue>{sermon.fileCode}</MetaValue>
                    </MetaItem>
                    <MetaItem>
                        <MetaLabel>공개 여부</MetaLabel>
                        <MetaValue>{sermon.public ? '공개' : '비공개'}</MetaValue>
                    </MetaItem>
                    <MetaItem>
                        <MetaLabel>최종 수정일</MetaLabel>
                        <MetaValue>
                            {new Date(sermon.updatedAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </MetaValue>
                    </MetaItem>
                </MetaSection>
            </ContentWrapper>
        </Container>
    );
};

const Container = styled.div`
    margin-left: 320px;
    padding: 40px;
    width: calc(100vw - 400px);
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
`;

const Header = styled.div`
    margin-bottom: 48px;
    border-bottom: 2px solid #f3f4f6;
    padding-bottom: 24px;
`;

const MetaInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;

    @media (max-width: 480px) {
        flex-direction: column;
        gap: 16px;
    }
`;

const AuthorDate = styled.div`
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

const Title = styled.h1`
    font-size: 32px;
    color: #212a3e;
    margin-bottom: 16px;
    font-weight: 800;
    line-height: 1.3;

    @media (max-width: 768px) {
        font-size: 28px;
    }

    @media (max-width: 480px) {
        font-size: 24px;
    }
`;

const Scripture = styled.div`
    display: flex;
    gap: 16px;
    font-size: 16px;
    color: #212a3e;

    @media (max-width: 480px) {
        flex-direction: column;
        gap: 8px;
    }
`;

const MainScripture = styled.span`
    font-weight: 500;
`;

const AdditionalScripture = styled.span`
    color: #666;
    &:before {
        content: '|';
        margin-right: 16px;
        color: #ddd;
    }

    @media (max-width: 480px) {
        &:before {
            content: '';
            margin-right: 0;
        }
    }
`;

const Section = styled.section`
    margin-bottom: 40px;
    padding-bottom: 32px;
    border-bottom: 1px solid #f3f4f6;

    &:last-child {
        margin-bottom: 0;
        border-bottom: none;
    }
`;

const SectionTitle = styled.h2`
    font-size: 20px;
    color: #212a3e;
    margin-bottom: 16px;
    font-weight: 600;
`;

const SummaryText = styled.p`
    font-size: 16px;
    line-height: 1.8;
    color: #4b5563;
    white-space: pre-wrap;
    background: #f8f9fa;
    padding: 24px;
    border-radius: 8px;
`;

const NotesText = styled(SummaryText)`
    white-space: pre-wrap;
`;

const RecordInfo = styled.p`
    font-size: 14px;
    color: #666;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
`;

const ContentView = styled.div`
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

const MetaSection = styled.div`
    margin-top: 40px;
    padding-top: 24px;
    border-top: 2px solid #f3f4f6;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;

    @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
        gap: 16px;
    }
`;

const MetaItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const MetaLabel = styled.span`
    font-size: 12px;
    color: #888;
    text-transform: uppercase;
`;

const MetaValue = styled.span`
    font-size: 14px;
    color: #333;
    font-weight: 500;
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

const TopBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
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

export default SermonDetailPage;

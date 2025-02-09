import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { getSermonDetail, deleteSermon } from '../../services/APIService';
import { ArrowLeft, Pencil, Trash2, Printer, ChevronDown } from 'lucide-react';
import { useUserState } from '../../recoil/utils';

const GlobalStyle = createGlobalStyle`
    @media print {
        @page {
            margin: 0;
            size: auto;
        }
        
        body {
            margin: 0;
            padding: 0;
        }

        .print-container {
            visibility: visible;
            position: relative;
            padding: 20mm;
            margin: 0;
            width: 100%;
        }

        .print-container * {
            visibility: visible;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
    }
`;

const SermonDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sermon, setSermon] = useState(null);
    const [loading, setLoading] = useState(true);
    const { userId: currentUserId, isAdmin } = useUserState();
    const currentPath = window.location.pathname;
    const isAdminPage = currentPath.includes('/admin/sermons');
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
    const [showGuide, setShowGuide] = useState(true);

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
        const timer = setTimeout(() => {
            setShowGuide(false);
        }, 3000);

        return () => clearTimeout(timer);
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

    const toggleHeader = () => {
        setIsHeaderExpanded((prev) => !prev);
    };

    const handlePrint = () => {
        const printContainer = document.createElement('div');
        printContainer.className = 'print-container';

        const content = document.querySelector('#printable-content').cloneNode(true);
        printContainer.appendChild(content);

        const style = document.createElement('style');
        style.textContent = `
        @media print {
            body > *:not(.print-container) {
                display: none;
            }
            .print-container {
                width: 100%;
                padding: 20mm;
                margin: 0;
                left: 0;
                position: absolute;
                box-sizing: border-box;
            }
            .print-container #printable-content {
                width: 100% !important;
                position: relative !important;
                margin: 0 !important;
                padding: 0 !important;
                left: 0 !important;
            }
            .print-container .sermon-content {
                margin: 0 !important;
                padding: 0 !important;
                max-width: 100% !important;
            }
        }
    `;

        document.body.appendChild(style);
        document.body.appendChild(printContainer);

        window.print();

        document.body.removeChild(style);
        document.body.removeChild(printContainer);
    };

    if (loading) {
        return <LoadingText>로딩 중...</LoadingText>;
    }

    if (!sermon) {
        return <EmptyText>설교를 찾을 수 없습니다.</EmptyText>;
    }

    return (
        <Container>
            <GlobalStyle />
            <HeaderContainer expanded={isHeaderExpanded} onClick={toggleHeader}>
                <TopBar>
                    <BackButton onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                        <span>뒤로 가기</span>
                    </BackButton>
                    {showGuide && (
                        <GuideMessage>
                            <span>클릭하여 더 자세한 내용을 확인해보세요</span>
                            <ChevronDown className="bounce" size={24} />
                        </GuideMessage>
                    )}
                    {!isHeaderExpanded && (
                        <CompactHeader>
                            <Label>설교 제목</Label>
                            <CompactTitle>{sermon.sermonTitle}</CompactTitle>
                        </CompactHeader>
                    )}
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
                {isHeaderExpanded && (
                    <>
                        <MetaInfo>
                            <FormSectionLong>
                                <Author>작성자: {sermon.ownerName}</Author>
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
                            </FormSectionLong>
                            <FormSection>
                                <Label>설교 제목</Label>
                                <Title>{sermon.sermonTitle}</Title>
                            </FormSection>
                        </MetaInfo>
                        <ScriptureInfo>
                            <FormSection>
                                <Label>성경 본문</Label>
                                <ScriptureContainer>
                                    <Scripture>{sermon.mainScripture}</Scripture>
                                    {sermon.additionalScripture && <Scripture>{sermon.additionalScripture}</Scripture>}
                                </ScriptureContainer>
                            </FormSection>
                        </ScriptureInfo>
                        <ExtraInfo>
                            <SectionContainer>
                                <SectionLabel>요약</SectionLabel>
                                <SectionBox>{sermon.summary}</SectionBox>
                            </SectionContainer>
                            {sermon.notes && (
                                <SectionContainer>
                                    <SectionLabel>노트</SectionLabel>
                                    <SectionBox>{sermon.notes}</SectionBox>
                                </SectionContainer>
                            )}
                        </ExtraInfo>
                    </>
                )}
            </HeaderContainer>
            <ContentSection>
                <Label>설교 내용</Label>
                <div id="printable-content">
                    <Content
                        className="sermon-content"
                        dangerouslySetInnerHTML={{
                            __html: sermon.contents[0]?.contentText || '',
                        }}
                    />
                </div>
            </ContentSection>
            <PrintButton onClick={handlePrint}>
                <Printer size={18} />
                인쇄하기
            </PrintButton>
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    min-height: 100vh;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
`;

const HeaderContainer = styled.div`
    background: white;
    border-bottom: 1px solid #ccc;
    position: sticky;
    top: 0;
    z-index: 100;
    padding: ${(props) => (props.expanded ? '32px' : '16px')};
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    transition: padding 0.3s ease;
    cursor: pointer;
`;

const CompactHeader = styled.div`
    display: block;
    padding: 8px 16px;
`;

const CompactTitle = styled.h1`
    font-size: 1.25rem;
    color: #333;
    margin: 0;
`;

const TopBar = styled.div`
    display: flex;
    justify-content: space-between;
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
    transition: background 0.2s ease;
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
    transition: background 0.2s ease, color 0.2s ease;

    &:hover {
        background: ${(props) => (props.isDelete ? '#fecaca' : '#e5e7eb')};
        color: ${(props) => (props.isDelete ? '#b91c1c' : '#3a2570')};
    }
`;

const MetaInfo = styled.div`
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const FormSectionLong = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    text-align: right;
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

const FormSection = styled.div`
    margin-top: 8px;
`;

const Label = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #4f3296;
    margin-bottom: 4px;
`;

const Title = styled.h1`
    font-size: 1.75rem;
    color: #333;
    font-weight: 600;
    margin: 0;
`;

const ScriptureInfo = styled.div`
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
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

const ExtraInfo = styled.div`
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
`;

const SectionContainer = styled.div`
    width: 100%;
`;

const SectionLabel = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #4f3296;
    margin-bottom: 4px;
`;

const SectionBox = styled.div`
    background: #f8f9fa;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 14px;
    color: #333;
    line-height: 1.5;
`;

const ContentSection = styled.div`
    background: white;
    padding: 32px;
    margin: 40px;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    min-height: 600px;
    display: flex;
    flex-direction: column;
`;

const Content = styled.div`
    font-size: 16px;
    line-height: 1.8;
    color: #333;

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

    p {
        margin: 1em 0;
        line-height: 1.8;
    }

    ul,
    ol {
        padding-left: 1.5em;
        margin: 1em 0;
    }

    li {
        margin: 0.5em 0;
    }

    blockquote {
        border-left: 4px solid #4f3296;
        margin: 1.5em 0;
        padding: 1em 1.5em;
        background: #f8f9fa;
        color: #666;
        font-style: italic;
    }

    img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 1em 0;
    }

    a {
        color: #4f3296;
        text-decoration: none;
        &:hover {
            text-decoration: underline;
        }
    }

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

const PrintButton = styled.button`
    position: fixed;
    right: 40px;
    bottom: 40px;
    padding: 12px 20px;
    background: #6b4ee6;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(107, 78, 230, 0.2);

    &:hover {
        background: #5a3eb8;
        transform: translateY(-2px);
    }

    @media print {
        display: none;
    }
`;

const GuideMessage = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(79, 50, 150, 0.9);
    color: white;
    padding: 12px 24px;
    border-radius: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    z-index: 101;
    animation: fadeIn 0.5s ease;
    backdrop-filter: blur(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    pointer-events: none;

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translate(-50%, -100%);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%);
        }
    }

    span {
        font-size: 14px;
        font-weight: 500;
    }

    .bounce {
        animation: bounce 1.5s infinite;
        color: white;
    }

    @keyframes bounce {
        0%,
        20%,
        50%,
        80%,
        100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(8px);
        }
        60% {
            transform: translateY(4px);
        }
    }
`;

export default SermonDetailPage;

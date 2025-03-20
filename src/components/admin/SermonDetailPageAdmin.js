import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import {
    getSermonDetail,
    deleteSermonAdmin,
    getTextList,
    deleteText,
    getTextDetail,
    updateText,
} from '../../services/APIService';
import { ArrowLeft, Pencil, Trash2, Printer, ChevronDown, BookOpen, X, ChevronLeft } from 'lucide-react';
import { useUserState } from '../../recoil/utils';
import SermonEditor from '../Editor/SermonEditor';

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

    body {
        overflow: ${(props) => (props.hideScroll ? 'hidden' : 'auto')};
    }
`;

const ContentStyles = `
    /* 폰트 크기 */
    .ql-size-8px { font-size: 8px; }
    .ql-size-9px { font-size: 9px; }
    .ql-size-10px { font-size: 10px; }
    .ql-size-11px { font-size: 11px; }
    .ql-size-12px { font-size: 12px; }
    .ql-size-14px { font-size: 14px; }
    .ql-size-16px { font-size: 16px; }
    .ql-size-18px { font-size: 18px; }
    .ql-size-24px { font-size: 24px; }
    .ql-size-36px { font-size: 36px; }
    .ql-size-48px { font-size: 48px; }
    .ql-size-72px { font-size: 72px; }
    .ql-size-96px { font-size: 96px; }

    /* 폰트 스타일 */
    .ql-font-noto-sans-kr { font-family: 'Noto Sans KR', sans-serif; }
    .ql-font-nanum-gothic { font-family: 'Nanum Gothic', sans-serif; }
    .ql-font-nanum-myeongjo { font-family: 'Nanum Myeongjo', serif; }
    .ql-font-nanum-pen-script { font-family: 'Nanum Pen Script', cursive; }
    .ql-font-poor-story { font-family: 'Poor Story', cursive; }
    .ql-font-jua { font-family: 'Jua', sans-serif; }

    /* 정렬 */
    .ql-align-center { text-align: center; }
    .ql-align-right { text-align: right; }
    .ql-align-justify { text-align: justify; }

    /* 들여쓰기 */
    .ql-indent-1 { padding-left: 3em; }
    .ql-indent-2 { padding-left: 6em; }
    .ql-indent-3 { padding-left: 9em; }
    .ql-indent-4 { padding-left: 12em; }
    .ql-indent-5 { padding-left: 15em; }
    .ql-indent-6 { padding-left: 18em; }
    .ql-indent-7 { padding-left: 21em; }
    .ql-indent-8 { padding-left: 24em; }

    /* 기본 스타일 */
    p { margin: 0 0 1em 0; }
    strong { font-weight: bold; }
    em { font-style: italic; }
    u { text-decoration: underline; }
    s { text-decoration: line-through; }

    /* 제목 스타일 */
    h1, h2, h3, h4, h5, h6 {
        margin: 1.5em 0 0.5em;
        line-height: 1.2;
        font-weight: 600;
    }
    h1 { font-size: 2em; }
    h2 { font-size: 1.75em; }
    h3 { font-size: 1.5em; }
    h4 { font-size: 1.25em; }
    h5 { font-size: 1em; }
    h6 { font-size: 0.875em; }

    /* 리스트 */
    ul, ol {
        padding-left: 1.5em;
        margin: 0 0 1em 0;
    }

    /* 인용구 */
    blockquote {
        border-left: 4px solid #ccc;
        margin: 1em 0;
        padding-left: 16px;
        font-style: italic;
    }
`;

const VersionDivider = styled.div`
    height: 1px;
    background-color: #e1e1e1;
    margin: 4px 0;
`;

const SermonDetailPageAdmin = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [sermon, setSermon] = useState(null);
    const [loading, setLoading] = useState(true);
    const { userId: currentUserId, isAdmin } = useUserState();
    const currentPath = window.location.pathname;
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
    const [showGuide, setShowGuide] = useState(true);
    const editorRef = useRef(null);
    const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);
    const [versions, setVersions] = useState([]);
    const [originalContent, setOriginalContent] = useState(null);
    const [selectedVersionId, setSelectedVersionId] = useState(null);
    const [selectedVersion, setSelectedVersion] = useState(null);

    useEffect(() => {
        const fetchSermonDetail = async () => {
            try {
                const data = await getSermonDetail(id);
                setSermon(data);

                // 본문 내용 가져오기
                if (data.contentTextId) {
                    const textResponse = await getTextDetail(id, data.contentTextId, currentUserId);
                    setOriginalContent(textResponse.textContent);
                }
            } catch (error) {
                console.error('Error fetching sermon detail:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSermonDetail();
        }
    }, [id, currentUserId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowGuide(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchVersions = async (id, currentUserId, setVersions, sermonData) => {
            try {
                const response = await getTextList(id, currentUserId);
                if (response && Array.isArray(response)) {
                    // 원본 버전을 제외한 버전들만 필터링
                    const filteredVersions = response.filter((version) => version.id !== sermonData?.contentTextId);
                    setVersions(filteredVersions);
                }
            } catch (error) {
                console.error('Error fetching versions:', error);
            }
        };

        if (id && currentUserId && sermon?.contentTextId) {
            fetchVersions(id, currentUserId, setVersions, sermon);
        }
    }, [id, currentUserId, sermon?.contentTextId]);

    const handleDelete = async () => {
        if (window.confirm('정말로 이 설교를 삭제하시겠습니까?')) {
            try {
                await deleteSermonAdmin(id, sermon.userId);
                alert('설교가 삭제되었습니다.');
                navigate(-1);
            } catch (error) {
                console.error('Error deleting sermon:', error);
                alert('설교 삭제 중 오류가 발생했습니다.');
            }
        }
    };

    const handleSermonEdit = () => {
        // 버전 수정인 경우
        if (selectedVersionId) {
            navigate(`/main/admin/sermons/${id}/versions/${selectedVersionId}/edit`);
        }
        // 원본 수정인 경우
        else {
            navigate(`/main/admin/sermons/edit/${id}`);
        }
    };

    const toggleHeader = () => {
        setIsHeaderExpanded((prev) => !prev);
    };

    const handlePrint = () => {
        const printContent = document.createElement('div');
        printContent.className = 'print-container';

        // 메타 정보 섹션
        const metaSection = document.createElement('div');
        metaSection.className = 'print-meta-section';
        metaSection.innerHTML = `
            <h1>${sermon.sermonTitle}</h1>
            <div class="print-meta-info">
                <div class="print-details">
                    <p><strong>설교자:</strong> ${sermon.ownerName}</p>
                    <p><strong>설교일:</strong> ${new Date(sermon.sermonDate).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}</p>
                    <p><strong>예배:</strong> ${sermon.worshipType}</p>
                </div>
                ${
                    sermon.summary
                        ? `
                    <div class="print-summary">
                        <strong>요약:</strong>
                        <p>${sermon.summary}</p>
                    </div>
                `
                        : ''
                }
            </div>
        `;

        const content = document.querySelector('#printable-content').cloneNode(true);

        printContent.appendChild(metaSection);
        printContent.appendChild(content);

        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${sermon.sermonTitle}</title>
                    <style>
                        @page {
                            margin: 20mm;
                            size: auto;
                            
                            @bottom-left {
                                content: "${new Date(sermon.sermonDate).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}";
                                font-family: 'Noto Sans KR', sans-serif;
                                font-size: 10px;
                                color: #666;
                            }
                            
                            @bottom-center {
                                content: "${sermon.worshipType}";
                                font-family: 'Noto Sans KR', sans-serif;
                                font-size: 10px;
                                color: #666;
                            }
                            
                            @bottom-right {
                                content: counter(page);
                                font-family: 'Noto Sans KR', sans-serif;
                                font-size: 10px;
                                color: #666;
                            }
                        }
                        body {
                            font-family: 'Noto Sans KR', sans-serif;
                            line-height: 1.6;
                            color: #333;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .print-container {
                            max-width: 100%;
                        }
                        .print-meta-section {
                            margin-bottom: 40px;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #e9ecef;
                        }
                        .print-meta-section h1 {
                            font-size: 28px;
                            margin-bottom: 24px;
                            color: #333;
                            font-weight: 600;
                        }
                        .print-meta-info {
                            font-size: 14px;
                            color: #495057;
                        }
                        .print-scripture {
                            margin-bottom: 20px;
                            padding: 16px;
                            background: #f8f9fa;
                            border-radius: 8px;
                            border: 1px solid #e9ecef;
                        }
                        .print-scripture strong {
                            color: #4f3296;
                            display: block;
                            margin-bottom: 8px;
                        }
                        .print-details {
                            margin-bottom: 20px;
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 16px;
                        }
                        .print-details p {
                            margin: 4px 0;
                        }
                        .print-details strong {
                            color: #4f3296;
                            display: block;
                            margin-bottom: 4px;
                        }
                        .print-summary {
                            background: #f8f9fa;
                            padding: 16px;
                            border-radius: 8px;
                            border: 1px solid #e9ecef;
                        }
                        .print-summary strong {
                            color: #4f3296;
                            display: block;
                            margin-bottom: 8px;
                        }
                        .print-summary p {
                            margin: 0;
                            color: #495057;
                        }
                        /* 기존 컨텐츠 스타일 유지 */
                        ${ContentStyles}

                        /* 페이지 나눔 시 내용이 잘리지 않도록 설정 */
                        p, h1, h2, h3, h4, h5, h6 {
                            break-inside: avoid;
                        }
                    </style>
                </head>
                <body>
                    ${printContent.outerHTML}
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const handleVersionSelect = async (textId) => {
        try {
            if (textId === 'original') {
                setSermon((prev) => ({
                    ...prev,
                    contents: [{ contentText: originalContent }],
                }));
                setSelectedVersionId(null);
                setSelectedVersion(null);
                return;
            }

            const response = await getTextDetail(id, textId, currentUserId);
            if (response) {
                setSermon((prev) => ({
                    ...prev,
                    contents: [{ contentText: response.textContent }],
                }));
                setSelectedVersionId(textId);
                setSelectedVersion(response);
            }
        } catch (error) {
            console.error('Error fetching version:', error);
        }
    };

    const showEditButton =
        // 원본 수정 (버전 선택 안된 경우)
        (!selectedVersionId && sermon?.userId === currentUserId) ||
        // 버전 수정
        selectedVersion?.userId === currentUserId ||
        // 관리자
        isAdmin;

    if (loading) {
        return <LoadingText>로딩 중...</LoadingText>;
    }

    if (!sermon) {
        return <EmptyText>설교를 찾을 수 없습니다.</EmptyText>;
    }

    return (
        <>
            <GlobalStyle hideScroll={false} />
            <Container>
                <HeaderContainer expanded={isHeaderExpanded} onClick={toggleHeader}>
                    <TopBar>
                        <BackButton
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(-1);
                            }}
                        >
                            <ArrowLeft size={20} />
                            <span>뒤로 가기</span>
                        </BackButton>
                        {!isHeaderExpanded && (
                            <CompactHeader>
                                <div>
                                    <CompactMeta>
                                        <CompactDate>
                                            {new Date(sermon.sermonDate).toLocaleDateString('ko-KR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </CompactDate>
                                        <CompactDate>{sermon.worshipType}</CompactDate>
                                    </CompactMeta>
                                    <CompactTitle>{sermon.sermonTitle}</CompactTitle>
                                    <CompactScripture>
                                        <span>{sermon.mainScripture}</span>
                                        {sermon.additionalScripture && <span>{sermon.additionalScripture}</span>}
                                    </CompactScripture>
                                </div>
                            </CompactHeader>
                        )}
                        <HeaderButtonGroup>
                            <VersionDropdown>
                                <VersionButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsVersionDropdownOpen(!isVersionDropdownOpen);
                                    }}
                                >
                                    <BookOpen size={16} />
                                    버전
                                    <ChevronDown size={14} />
                                </VersionButton>
                                <DropdownContent isOpen={isVersionDropdownOpen}>
                                    <VersionItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleVersionSelect('original');
                                            setIsVersionDropdownOpen(false);
                                        }}
                                    >
                                        <VersionInfo>
                                            <VersionTitle>{sermon?.sermonTitle}</VersionTitle>
                                            <VersionMeta>
                                                <VersionAuthor>{sermon?.ownerName}</VersionAuthor>
                                                <VersionDate>
                                                    {new Date(sermon?.createdAt).toLocaleDateString('ko-KR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </VersionDate>
                                            </VersionMeta>
                                        </VersionInfo>
                                        <OriginalTag>원본</OriginalTag>
                                    </VersionItem>
                                    {versions.length > 0 && <VersionDivider />}
                                    {versions.map((version) => (
                                        <VersionItem
                                            key={version.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleVersionSelect(version.id);
                                                setIsVersionDropdownOpen(false);
                                            }}
                                        >
                                            <VersionInfo>
                                                <VersionTitle>{version.textTitle || '제목 없음'}</VersionTitle>
                                                <VersionMeta>
                                                    <VersionAuthor>{version.userName}</VersionAuthor>
                                                    <VersionDate>
                                                        {new Date(version.textCreatedAt).toLocaleDateString('ko-KR', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </VersionDate>
                                                </VersionMeta>
                                            </VersionInfo>
                                        </VersionItem>
                                    ))}
                                    <CreateVersionButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/main/sermons/${id}/create-version`);
                                        }}
                                    >
                                        <span>+ 버전 생성하기</span>
                                    </CreateVersionButton>
                                </DropdownContent>
                            </VersionDropdown>
                            <ActionButtons>
                                {showEditButton && (
                                    <ActionButton onClick={handleSermonEdit}>
                                        <Pencil size={18} />
                                    </ActionButton>
                                )}
                                <ActionButton isDelete onClick={handleDelete}>
                                    <Trash2 size={18} />
                                </ActionButton>
                            </ActionButtons>
                        </HeaderButtonGroup>
                        {showGuide && (
                            <GuideMessage>
                                <span>클릭하여 더 자세한 내용을 확인해보세요</span>
                                <ChevronDown className="bounce" size={24} />
                            </GuideMessage>
                        )}
                    </TopBar>
                    {isHeaderExpanded && (
                        <>
                            <MetaInfo>
                                <FormSectionLong>
                                    <Author>{sermon.ownerName}</Author>
                                    <DateInfo>
                                        <SermonDate>
                                            {new Date(sermon.sermonDate).toLocaleDateString('ko-KR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </SermonDate>
                                        <WorshipTag>{sermon.worshipType}</WorshipTag>
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
                                        {sermon.additionalScripture && (
                                            <Scripture>{sermon.additionalScripture}</Scripture>
                                        )}
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
                                __html: selectedVersion
                                    ? sermon?.contents?.[0]?.contentText || ''
                                    : originalContent || '',
                            }}
                        />
                    </div>
                </ContentSection>
                <PrintButton onClick={handlePrint}>
                    <Printer size={18} />
                    인쇄하기
                </PrintButton>
            </Container>
        </>
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

const TopBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const CompactHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    margin: 0 40px;
    text-align: center;
`;

const CompactMeta = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-bottom: 4px;
`;

const CompactDate = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 13px;

    &:not(:last-child)::after {
        content: '';
        width: 3px;
        height: 3px;
        background: #ccc;
        border-radius: 50%;
        margin-left: 8px;
    }
`;

const CompactScripture = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    margin-top: 4px;
    flex-wrap: wrap;

    span {
        font-size: 13px;
        color: #482895;
        padding: 4px 12px;
        background: #eee6ff;
        border-radius: 6px;
        border: 1px solid #d4c4ff;
    }
`;

const CompactTitle = styled.h1`
    font-size: 1.25rem;
    color: #333;
    margin: 0;
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

const HeaderButtonGroup = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
`;

const VersionDropdown = styled.div`
    position: relative;
    display: inline-block;
`;

const VersionButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: white;
    border: 1px solid #e1e1e1;
    border-radius: 8px;
    color: #333;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #f8f9fa;
        border-color: #4f3296;
    }

    svg {
        color: #4f3296;
    }
`;

const DropdownContent = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    background: white;
    border: 1px solid #e1e1e1;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    min-width: 300px;
    z-index: 1000;
    display: ${(props) => (props.isOpen ? 'block' : 'none')};
`;

const VersionItem = styled.div`
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:hover {
        background: #f8f9fa;
    }

    &:not(:last-child) {
        border-bottom: 1px solid #e1e1e1;
    }
`;

const CreateVersionButton = styled(VersionItem)`
    color: #4f3296;
    font-weight: 500;

    &:hover {
        background: #f8f4ff;
    }

    svg {
        color: #4f3296;
    }
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
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

const WorshipTag = styled.span`
    font-size: 12px;
    padding: 4px 12px;
    background: #eee6ff;
    border: 1px solid #d4c4ff;
    border-radius: 4px;
    color: #482895;
    margin-left: 12px;
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
    padding: 24px;
    background: white;
    border-radius: 12px;
    min-height: 200px;
    line-height: 1.6;

    ${ContentStyles}

    img {
        max-width: 100%;
        height: auto;
    }

    /* 에디터 내용의 border 제거 */
    .ql-container.ql-snow {
        border: none;
    }

    .ql-editor {
        border: none;
        padding: 0;
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

const VersionInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const VersionTitle = styled.span`
    font-weight: 500;
    color: #333;
`;

const VersionMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #666;
`;

const VersionAuthor = styled.span`
    color: #4f3296;
    font-weight: 500;
`;

const VersionDate = styled.span`
    &::before {
        content: '•';
        margin-right: 8px;
        color: #ccc;
    }
`;

const OriginalTag = styled.span`
    font-size: 11px;
    padding: 2px 8px;
    background: #eee6ff;
    border: 1px solid #d4c4ff;
    border-radius: 4px;
    color: #482895;
`;

export default SermonDetailPageAdmin;

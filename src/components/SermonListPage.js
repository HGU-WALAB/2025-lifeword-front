import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getPublicSermons } from '../services/APIService';
import { X, Calendar, User, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 20;

const SermonListPage = () => {
    const [sermons, setSermons] = useState([]);
    const [selectedSermon, setSelectedSermon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('public');
    const [mySermonFilter, setMySermonFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        if (filterType === 'public') {
            fetchPublicSermons();
        }
    }, [filterType]);

    const fetchPublicSermons = async () => {
        try {
            setLoading(true);
            const data = await getPublicSermons();
            setSermons(data);
        } catch (error) {
            console.error('Error fetching public sermons:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(sermons.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentSermons = sermons.slice(startIndex, endIndex);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo(0, 0);
        }
    };

    const getVisiblePages = () => {
        if (totalPages <= 11) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages = [];

        for (let i = 1; i <= 5; i++) {
            pages.push(i);
        }

        pages.push('...');

        for (let i = totalPages - 4; i <= totalPages; i++) {
            pages.push(i);
        }

        return pages;
    };

    return (
        <Container>
            <PageHeader>
                <Title>설교 목록</Title>
                <Description>등록된 설교 목록을 확인하고 내용을 살펴보세요.</Description>
                <FilterContainer>
                    <FilterButton active={filterType === 'public'} onClick={() => setFilterType('public')}>
                        전체 공개 설교
                    </FilterButton>
                    <MySermonFilterContainer>
                        <FilterButton active={filterType === 'my'} onClick={() => setFilterType('my')}>
                            내 설교
                        </FilterButton>
                        {filterType === 'my' && (
                            <SubFilterContainer>
                                <SubFilterButton
                                    active={mySermonFilter === 'all'}
                                    onClick={() => setMySermonFilter('all')}
                                >
                                    전체
                                </SubFilterButton>
                                <SubFilterButton
                                    active={mySermonFilter === 'public'}
                                    onClick={() => setMySermonFilter('public')}
                                >
                                    공개
                                </SubFilterButton>
                                <SubFilterButton
                                    active={mySermonFilter === 'private'}
                                    onClick={() => setMySermonFilter('private')}
                                >
                                    비공개
                                </SubFilterButton>
                            </SubFilterContainer>
                        )}
                    </MySermonFilterContainer>
                </FilterContainer>
            </PageHeader>
            <ContentWrapper>
                {filterType === 'public' && (
                    <>
                        <SermonList>
                            {loading ? (
                                <LoadingText>로딩 중...</LoadingText>
                            ) : currentSermons.length > 0 ? (
                                currentSermons.map((sermon) => (
                                    <SermonCard
                                        key={sermon.sermonId}
                                        onClick={() => {
                                            navigate(`detail/${sermon.sermonId}`);
                                        }}
                                    >
                                        <WorshipType>{sermon.worshipType}</WorshipType>
                                        <div>
                                            <AuthorName>{sermon.ownerName}</AuthorName>
                                            <SermonDate>{new Date(sermon.sermonDate).toLocaleDateString()}</SermonDate>
                                        </div>
                                        <SermonTitle>{sermon.sermonTitle}</SermonTitle>
                                        <ScriptureContainer>
                                            <Scripture>{sermon.mainScripture}</Scripture>
                                        </ScriptureContainer>
                                        <SermonSummary>{sermon.summary}</SermonSummary>
                                    </SermonCard>
                                ))
                            ) : (
                                <EmptyText>등록된 설교가 없습니다.</EmptyText>
                            )}
                        </SermonList>
                        {!loading && sermons.length > 0 && (
                            <PaginationContainer>
                                <PaginationButton
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={20} />
                                </PaginationButton>

                                <PageNumbers>
                                    {getVisiblePages().map((page, index) => (
                                        <PageButton
                                            key={index}
                                            active={currentPage === page}
                                            onClick={() => (typeof page === 'number' ? handlePageChange(page) : null)}
                                            disabled={typeof page !== 'number'}
                                        >
                                            {page}
                                        </PageButton>
                                    ))}
                                </PageNumbers>

                                <PaginationButton
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight size={20} />
                                </PaginationButton>
                            </PaginationContainer>
                        )}
                    </>
                )}
            </ContentWrapper>

            {selectedSermon && (
                <ModalOverlay onClick={() => setSelectedSermon(null)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>{selectedSermon.title}</ModalTitle>
                            <CloseButton onClick={() => setSelectedSermon(null)}>
                                <X size={24} />
                            </CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <SermonInfo>
                                <InfoItem>
                                    <InfoLabel>
                                        <User size={16} />
                                        작성자
                                    </InfoLabel>
                                    {selectedSermon.owner}
                                </InfoItem>
                                <InfoItem>
                                    <InfoLabel>
                                        <Calendar size={16} />
                                        설교 날짜
                                    </InfoLabel>
                                    {selectedSermon.sermonDate}
                                </InfoItem>
                                <InfoItem>
                                    <InfoLabel>
                                        <Tag size={16} />
                                        키워드
                                    </InfoLabel>
                                    {selectedSermon.keywords.join(', ')}
                                </InfoItem>
                            </SermonInfo>
                            <SermonContent>{selectedSermon.sermonContent}</SermonContent>
                        </ModalBody>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Container>
    );
};

const Container = styled.div`
    margin-left: 320px;
    padding: 40px;
    width: calc(100vw - 400px);
    min-height: 91vh;
    background-color: #f5f5f5;
`;

const PageHeader = styled.div`
    margin-bottom: 40px;
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

const ContentWrapper = styled.div`
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;

    @media (max-width: 1024px) {
        padding: 16px;
    }
`;

const SermonList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
`;

const SermonCard = styled.div`
    box-sizing: border-box;
    position: relative;
    width: 100%;
    max-width: 800px;
    min-height: 180px;
    margin: 0 auto;
    padding: 24px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
    }
`;

const AuthorName = styled.span`
    display: inline-block;
    font-family: 'Inter';
    font-weight: 500;
    font-size: 12px;
    color: #595c62;
    margin-right: 16px;
`;

const SermonDate = styled.span`
    display: inline-block;
    font-family: 'Inter';
    font-weight: 500;
    font-size: 12px;
    color: #595c62;
`;

const SermonTitle = styled.h2`
    font-family: 'Inter';
    font-weight: 800;
    font-size: 24px;
    color: #212a3e;
    margin: 16px 0;
    padding-right: 120px; // worshipType을 위한 공간
`;

const ScriptureContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
`;

const Scripture = styled.span`
    font-family: 'Inter';
    font-weight: 500;
    font-size: 12px;
    color: #212a3e;
`;

const WorshipType = styled.span`
    position: absolute;
    top: 24px;
    right: 24px;
    padding: 6px 12px;
    background: #f3f4f6;
    border-radius: 20px;
    font-family: 'Inter';
    font-weight: 500;
    font-size: 12px;
    color: #4f3296;
`;

const SermonSummary = styled.p`
    font-family: 'Inter';
    font-weight: 500;
    font-size: 14px;
    line-height: 1.6;
    color: #4b5563;
    margin: 0;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
    background: white;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    border-radius: 16px;
    padding: 32px;
    overflow-y: auto;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #eee;
`;

const ModalTitle = styled.h2`
    color: #4f3296;
    margin: 0;
    font-size: 1.8rem;
    font-weight: 600;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background-color: #f5f5f5;
        color: #4f3296;
    }
`;

const ModalBody = styled.div`
    padding: 16px 0;
`;

const SermonInfo = styled.div`
    background: #f8f8f8;
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 32px;
`;

const InfoItem = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 1.1rem;
    color: #333;

    &:last-child {
        margin-bottom: 0;
    }
`;

const InfoLabel = styled.span`
    display: flex;
    align-items: center;
    gap: 8px;
    width: 120px;
    color: #666;
    font-weight: 500;

    svg {
        color: #4f3296;
    }
`;

const SermonContent = styled.div`
    line-height: 1.8;
    white-space: pre-wrap;
    color: #333;
    font-size: 1.1rem;
`;

const LoadingText = styled.div`
    text-align: center;
    padding: 40px;
    color: #666;
    grid-column: 1 / -1;
    font-size: 1.1rem;
`;

const EmptyText = styled(LoadingText)`
    color: #999;
`;

const FilterContainer = styled.div`
    display: flex;
    gap: 16px;
    margin-top: 24px;
`;

const MySermonFilterContainer = styled.div`
    display: flex;
    gap: 16px;
    align-items: center;
`;

const FilterButton = styled.button`
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    background-color: ${(props) => (props.active ? '#4f3296' : '#fff')};
    color: ${(props) => (props.active ? '#fff' : '#4f3296')};
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid ${(props) => (props.active ? '#4f3296' : '#eee')};

    &:hover {
        background-color: ${(props) => (props.active ? '#3a2570' : '#f8f5ff')};
    }
`;

const SubFilterContainer = styled.div`
    display: flex;
    gap: 8px;
    padding: 4px;
    background-color: #f5f5f5;
    border-radius: 8px;
`;

const SubFilterButton = styled.button`
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    background-color: ${(props) => (props.active ? '#4f3296' : 'transparent')};
    color: ${(props) => (props.active ? '#fff' : '#666')};
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${(props) => (props.active ? '#3a2570' : '#e5e5e5')};
    }
`;

const PaginationContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
    background-color: #f5f5f5;
    width: 100%;
    max-width: 800px;
    justify-content: center;
    margin: 32px auto;
`;

const PaginationButton = styled.button`
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background-color: ${(props) => (props.disabled ? '#f5f5f5' : '#4F3296')};
    color: ${(props) => (props.disabled ? '#999' : 'white')};
    cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background-color: #3a2570;
    }
`;

const PageNumbers = styled.div`
    display: flex;
    gap: 8px;
    overflow-x: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
    padding: 8px 4px;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const PageButton = styled.button`
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background-color: ${(props) => (props.active ? '#4F3296' : '#f5f5f5')};
    color: ${(props) => (props.active ? 'white' : props.disabled ? '#999' : '#333')};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    transition: all 0.2s ease;
    font-size: 14px;

    &:hover {
        background-color: ${(props) => {
            if (props.disabled) return '#f5f5f5';
            return props.active ? '#3a2570' : '#e5e5e5';
        }};
    }
`;

export default SermonListPage;

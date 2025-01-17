import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { getPublicSermons, getUserSermons, searchSermons } from '../services/APIService';

const ITEMS_PER_PAGE = 20;

const SermonListPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchMode, setSearchMode] = useState('both');
    const [isSearching, setIsSearching] = useState(false);

    // URL 파라미터에서 필터 상태 읽기
    const filterType = searchParams.get('type') || 'public';
    const mySermonFilter = searchParams.get('filter') || 'all';

    // 필터 변경 핸들러
    const handleFilterChange = (type, filter = 'all') => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('type', type);
        if (type === 'my') {
            newParams.set('filter', filter);
        } else {
            newParams.delete('filter');
        }
        setSearchParams(newParams);
        setCurrentPage(1);
    };

    const fetchSermons = useCallback(async () => {
        try {
            setLoading(true);
            if (filterType === 'public') {
                const data = await getPublicSermons();
                setSermons(data);
            } else {
                const userId = localStorage.getItem('UID');
                const data = await getUserSermons(userId, mySermonFilter);
                setSermons(data);
            }
        } catch (error) {
            console.error('Error fetching sermons:', error);
        } finally {
            setLoading(false);
        }
    }, [filterType, mySermonFilter]);

    useEffect(() => {
        fetchSermons();
    }, [filterType, mySermonFilter, fetchSermons]);

    const totalPages = Math.ceil(sermons.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentSermons = sermons.slice(startIndex, endIndex);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            if (!isSearching) {
                window.scrollTo(0, 0);
            }
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

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchKeyword.trim()) return;

        try {
            setLoading(true);
            setIsSearching(true);
            const userId = localStorage.getItem('UID');
            const data = await searchSermons(searchKeyword, userId, searchMode);
            const filteredData = data.filter((sermon) => {
                if (filterType === 'public') {
                    return sermon.public;
                } else if (filterType === 'my') {
                    if (mySermonFilter === 'public') return sermon.public;
                    if (mySermonFilter === 'private') return !sermon.public;
                    return true; // 'all' 인 경우
                }
                return true;
            });
            setSermons(filteredData);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error searching sermons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResetSearch = () => {
        setSearchKeyword('');
        setIsSearching(false);
        setSearchMode('both');
        fetchSermons();
        setCurrentPage(1);
    };

    return (
        <Container>
            <PageHeader>
                <Title>설교 목록</Title>
                <Description>등록된 설교 목록을 확인하고 내용을 살펴보세요.</Description>
                <FilterContainer>
                    <FilterButton active={filterType === 'public'} onClick={() => handleFilterChange('public')}>
                        전체 공개 설교
                    </FilterButton>
                    <MySermonFilterContainer>
                        <FilterButton active={filterType === 'my'} onClick={() => handleFilterChange('my')}>
                            내 설교
                        </FilterButton>
                        {filterType === 'my' && (
                            <SubFilterContainer>
                                <SubFilterButton
                                    active={mySermonFilter === 'all'}
                                    onClick={() => handleFilterChange('my', 'all')}
                                >
                                    전체
                                </SubFilterButton>
                                <SubFilterButton
                                    active={mySermonFilter === 'public'}
                                    onClick={() => handleFilterChange('my', 'public')}
                                >
                                    공개
                                </SubFilterButton>
                                <SubFilterButton
                                    active={mySermonFilter === 'private'}
                                    onClick={() => handleFilterChange('my', 'private')}
                                >
                                    비공개
                                </SubFilterButton>
                            </SubFilterContainer>
                        )}
                    </MySermonFilterContainer>
                </FilterContainer>
            </PageHeader>
            <ContentWrapper>
                <SermonList>
                    {loading ? (
                        <LoadingText>로딩 중...</LoadingText>
                    ) : currentSermons.length > 0 ? (
                        currentSermons.map((sermon) => (
                            <SermonCard
                                key={sermon.sermonId}
                                onClick={() => {
                                    navigate(`detail/${sermon.sermonId}?type=${filterType}`);
                                }}
                            >
                                <WorshipType>{sermon.worshipType}</WorshipType>
                                <div>
                                    <AuthorName>{sermon.ownerName}</AuthorName>
                                    <SermonDate>
                                        {new Date(sermon.sermonDate).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </SermonDate>
                                </div>
                                <SermonTitle>{sermon.sermonTitle}</SermonTitle>
                                <ScriptureContainer>
                                    <Scripture>{sermon.mainScripture}</Scripture>
                                    {sermon.additionalScripture && (
                                        <AdditionalScripture>{sermon.additionalScripture}</AdditionalScripture>
                                    )}
                                </ScriptureContainer>
                                <SermonSummary>{sermon.summary}</SermonSummary>
                                {filterType === 'my' && (
                                    <PublicBadge isPublic={sermon.public}>
                                        {sermon.public ? '공개' : '비공개'}
                                    </PublicBadge>
                                )}
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
                <SearchContainer>
                    <SearchForm onSubmit={handleSearch}>
                        <SearchInputWrapper>
                            <SearchInput
                                type="text"
                                placeholder="설교 검색..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                            <SearchButton type="submit">
                                <Search size={20} />
                            </SearchButton>
                        </SearchInputWrapper>
                        <SearchOptions>
                            <SearchOption active={searchMode === 'both'} onClick={() => setSearchMode('both')}>
                                제목+내용
                            </SearchOption>
                            <SearchOption active={searchMode === 'title'} onClick={() => setSearchMode('title')}>
                                제목
                            </SearchOption>
                            <SearchOption active={searchMode === 'content'} onClick={() => setSearchMode('content')}>
                                내용
                            </SearchOption>
                        </SearchOptions>
                        {isSearching && (
                            <ResetButton type="button" onClick={handleResetSearch}>
                                검색 초기화
                            </ResetButton>
                        )}
                    </SearchForm>
                </SearchContainer>
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
    padding-right: 120px;
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

const AdditionalScripture = styled(Scripture)`
    color: #666;
    &:before {
        content: '|';
        margin-right: 8px;
        margin-left: 8px;
        color: #ddd;
    }
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

const PublicBadge = styled.div`
    position: absolute;
    top: 24px;
    right: 120px;
    padding: 6px 12px;
    background: ${(props) => (props.isPublic ? '#4F3296' : '#666')};
    color: white;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
`;

const SearchContainer = styled.div`
    margin-top: 40px;
    padding: 24px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
`;

const SearchForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const SearchInputWrapper = styled.div`
    display: flex;
    gap: 8px;
    width: 100%;
`;

const SearchInput = styled.input`
    flex: 1;
    padding: 12px 16px;
    border: 2px solid #eee;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #4f3296;
    }
`;

const SearchButton = styled.button`
    padding: 12px 24px;
    background: #4f3296;
    border: none;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: #3a2570;
    }
`;

const SearchOptions = styled.div`
    display: flex;
    gap: 8px;
    padding: 4px;
    background: #f5f5f5;
    border-radius: 8px;
    width: fit-content;
`;

const SearchOption = styled.button`
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: ${(props) => (props.active ? '#4f3296' : 'transparent')};
    color: ${(props) => (props.active ? 'white' : '#666')};
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${(props) => (props.active ? '#3a2570' : '#e5e5e5')};
    }
`;

const ResetButton = styled.button`
    padding: 8px 16px;
    background: transparent;
    border: 1px solid #4f3296;
    border-radius: 8px;
    color: #4f3296;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: fit-content;

    &:hover {
        background: #f8f5ff;
    }
`;

export default SermonListPage;

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { getPublicSermons, getUserSermons, searchSermons } from '../../services/APIService';
import { useUserState } from '../../recoil/utils';

const ITEMS_PER_PAGE = 20;

const SermonListPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const {searchType} = useState('title');
    const [searchValue, setSearchValue] = useState('');
    const { userId } = useUserState();
    const [viewType, setViewType] = useState('list'); // 'list' (기본값)
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' (최신순) 또는 'oldest' (오래된 순)
    const [filteredSermons, setFilteredSermons] = useState([]);
    const [selectedWorshipType, setSelectedWorshipType] = useState('all'); // 기본값: 전체 보기
    const [isMySermonExpanded, setIsMySermonExpanded] = useState(false); // 내 설교 버튼 활성화 상태.

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
            setIsMySermonExpanded(false); // 🔹 "전체 공개 설교" 클릭 시 애니메이션 닫기
        }
        setSearchParams(newParams);
        setCurrentPage(1);
    };

    const handleWorshipTypeChange = (event) => {


        const newType = event.target.value;
        setSelectedWorshipType(newType);


        // 🔹 검색 중이면 검색 결과에서 예배 유형 필터링
        if (isSearching) {
            handleSearch();
        } else {
            fetchSermons();
        }
    };

    const fetchSermons = useCallback(async () => {
        try {
            setLoading(true);
            let data = [];

            if (filterType === 'public') {
                data = await getPublicSermons();
            } else {
                data = await getUserSermons(userId, mySermonFilter);
            }

            // 🔹 검색 결과 유지
            if (filteredSermons.length > 0) {
                data = [...filteredSermons];
            }

            // 🔹 선택된 worshipType이 있으면 필터링
            if (selectedWorshipType !== 'all') {
                data = data.filter((sermon) => sermon.worshipType === selectedWorshipType);
            }

            // 🔹 최신순 / 오래된 순 정렬
            data.sort((a, b) => {
                if (sortOrder === 'newest') {
                    return new Date(b.sermonDate) - new Date(a.sermonDate);
                } else {
                    return new Date(a.sermonDate) - new Date(b.sermonDate);
                }
            });

            setSermons(data);
        } catch (error) {
            console.error('Error fetching sermons:', error);
        } finally {
            setLoading(false);
        }
    }, [filterType, userId, mySermonFilter, sortOrder, filteredSermons, selectedWorshipType]);



    useEffect(() => {
        fetchSermons();
    }, [filterType, userId, mySermonFilter, fetchSermons]);

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

    const handleSortChange = (order) => {
        setSortOrder(order);
        if (isSearching) {
            handleSearch(); // 검색된 상태에서 정렬을 바꾸면 검색 결과 유지
        } else {
            fetchSermons(); // 전체 데이터를 불러올 때 정렬 적용
        }
    };

    const handleSearch = async () => {
        if (!searchValue.trim()) {
            fetchSermons(); // 검색어가 없으면 전체 데이터 로드
            return;
        }

        setLoading(true);
        setIsSearching(true);

        try {
            const results = await searchSermons(searchValue, userId, searchType);
            let sortedResults = Array.isArray(results) ? results : [];

            // 🔹 선택된 예배 유형(worshipType)이 있으면 필터 적용
            if (selectedWorshipType !== 'all') {
                sortedResults = sortedResults.filter((sermon) => sermon.worshipType === selectedWorshipType);
            }

            // 🔹 최신 순 / 오래된 순 정렬
            sortedResults.sort((a, b) => {
                if (sortOrder === 'newest') {
                    return new Date(b.sermonDate) - new Date(a.sermonDate);
                } else {
                    return new Date(a.sermonDate) - new Date(b.sermonDate);
                }
            });

            setFilteredSermons(sortedResults);
            setCurrentPage(1);
        } catch (error) {
            console.error('Search failed:', error);
            setFilteredSermons([]);
        } finally {
            setLoading(false);
        }
    };
    const handleMySermonToggle = () => {
        setIsMySermonExpanded(!isMySermonExpanded);

        // 🔹 내 설교 버튼을 클릭했을 때 색상 즉시 변경
        if (!isMySermonExpanded) {
            setSearchParams(new URLSearchParams({ type: "my", filter: "all" }));
        }
    };


    return (
        <Container>
            <Header>

            </Header>
            <PageHeader>
                <Title>설교 목록</Title>
                <Description>등록된 설교 목록을 확인하고 내용을 살펴보세요.</Description>

                <SearchContainer>
                {/*    <Select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                        <option value="title">제목</option>
                        <option value="content">내용</option>
                        <option value="both">제목+내용</option>
                    </Select>*/}
                    <SearchInput
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="검색어를 입력하세요"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <SearchButton onClick={handleSearch} disabled={loading}>
                        {loading ? '검색 중...' : <Search size={20} />}
                    </SearchButton>
                </SearchContainer>
                <FilterContainer>
                    <FilterButton active={filterType === 'public'} onClick={() => handleFilterChange('public')}>
                        전체 공개 설교
                    </FilterButton>
                    <MySermonFilterContainer expanded={isMySermonExpanded}>
                        <FilterButton active={filterType === 'my'} onClick={handleMySermonToggle}>
                            내 설교
                        </FilterButton>

                        <SubFilterContainer expanded={isMySermonExpanded}>
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
                    </MySermonFilterContainer>

                    {/* 🔹 정렬 버튼 추가 */}
                    <SortButtonContainer>

                    </SortButtonContainer>
                    {/* 🔹 Worship Type 선택 드롭다운 추가 */}
                    <SelectContainer>

                    </SelectContainer>
                    {/* view 선택 버튼 추가 */}
                    <ViewToggleContainer>

                        <SortButton active={sortOrder === 'newest'} onClick={() => handleSortChange('newest')}>
                            최신 순
                        </SortButton>
                        <SortButton active={sortOrder === 'oldest'} onClick={() => handleSortChange('oldest')}>
                            오래된 순
                        </SortButton>
                        <ViewToggleButton active={viewType === 'list'} onClick={() => setViewType('list')}>
                            View 1
                        </ViewToggleButton>
                        <ViewToggleButton active={viewType === 'carousel'} onClick={() => setViewType('carousel')}>
                            View 2
                        </ViewToggleButton>
                        <StyledSelect
                            id="worshipType"
                            value={selectedWorshipType}
                            onChange={(e) => handleWorshipTypeChange(e)}
                        >
                            <option value="all">예배 유형</option>
                            <option value="새벽예배">새벽예배</option>
                            <option value="수요예배">수요예배</option>
                            <option value="금요성령집회">금요성령집회</option>
                            <option value="주일1부예배">주일1부예배</option>
                            <option value="주일2부예배">주일2부예배</option>
                            <option value="주일3부예배">주일3부예배</option>
                            <option value="주일청년예배">주일청년예배</option>
                            <option value="주일오후예배">주일오후예배</option>
                            <option value="특별집회">특별집회</option>
                            <option value="부흥회">부흥회</option>
                            <option value="월-새벽">월-새벽</option>
                            <option value="기타">기타</option>
                        </StyledSelect>
                    </ViewToggleContainer>

                </FilterContainer>
            </PageHeader>
            <ContentWrapper>
                <SermonList>
                    {loading ? (
                        <LoadingText>로딩 중...</LoadingText>
                    ) : sermons.length > 0 ? (
                        viewType === 'carousel' ? (
                            <SermonGrid>
                                {currentSermons.map((sermon) => (
                                    <SermonCardSecondView key={sermon.sermonId}
                                                onClick={() => navigate(`detail/${sermon.sermonId}?type=${filterType}`)}>
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
                                        <SermonTitleSecondView>{sermon.sermonTitle}</SermonTitleSecondView>
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
                                    </SermonCardSecondView>
                                ))}
                            </SermonGrid>
                        ) : (
                            <SermonList>
                                {currentSermons.map((sermon) => (
                                    <SermonCard key={sermon.sermonId}
                                                onClick={() => navigate(`detail/${sermon.sermonId}?type=${filterType}`)}>
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
                                ))}
                            </SermonList>
                        )
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
            </ContentWrapper>
        </Container>
    );
};

const Container = styled.div`
    margin-left: 100px;
    padding: 40px;
    width: calc(100vw);
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
  //gap: 1px;
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
    color: grey;
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
    align-items: center;
    gap: ${(props) => (props.expanded ? "10px" : "0px")};
    transition: gap 0.3s ease-in-out;
    height: 40px;  /* 🔹 컨테이너 높이 고정 */
`;




const SubFilterContainer = styled.div`
    display: flex;
    gap: 8px;
    overflow: hidden;
    max-width: ${(props) => (props.expanded ? "300px" : "0px")}; /* 🔹 펼쳐질 때 max-width 조정 */
    opacity: ${(props) => (props.expanded ? "1" : "0")};
    transition: max-width 0.3s ease-in-out, opacity 0.3s ease-in-out;
`;

/*
const MySermonFilterContainer = styled.div`
    display: flex;
    gap: 16px;
    align-items: center;
`;


const SubFilterContainer = styled.div`
    display: flex;
    gap: 8px;
    padding: 4px;
    background-color: #f5f5f5;
    border-radius: 8px;
`;
*/





const SubFilterButton = styled.button`
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    background-color: ${(props) => (props.active ? '#4F3296' : '#ddd')};
    color: ${(props) => (props.active ? '#fff' : '#666')};
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    height: 35px;  /* 🔹 컨테이너 높이 고정 */

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

const Header = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 30px;
`;

const SearchContainer = styled.div`
    display: flex;
  //padding-left: 900px;
    gap: 10px;
`;

const SearchInput = styled.input`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    width: 250px;
    font-size: 14px;
`;

const SearchButton = styled.button`
    padding: 8px 16px;
    background-color: #4f3296;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: #3b2570;
    }
`;




//서원 추가


const ViewToggleContainer = styled.div`
    display: flex;
    gap: 10px;
    margin-left:auto;
    //margin-left:400px;

`;

const ViewToggleButton = styled.button`
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background-color: ${(props) => (props.active ? '#4F3296' : '#ddd')};
    color: ${(props) => (props.active ? '#fff' : '#666')};
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s;

    &:hover {
        background-color: ${(props) => (props.active ? '#3b2570' : '#bbb')};
    }
`;
const FilterButton = styled.button`
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
        background-color: ${(props) => (props.active ? '#4F3296' : '#ddd')};
        color: ${(props) => (props.active ? '#fff' : '#666')};
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid ${(props) => (props.active ? '#4f3296' : '#eee')};

    &:hover {
        background-color: ${(props) => (props.active ? '#3b2570' : '#bbb')};
    }
`;
const SermonCardSecondView = styled.div`
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

const SermonGrid = styled.div`
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); 
        gap: 20px;
        padding: 20px;
    `;

const SermonTitleSecondView = styled.h2`
    font-family: 'Inter';
    font-weight: 800;
    font-size: 24px;
    color: #212a3e;
    margin: 16px 0;
    padding-right: 60px;
`;

const SortButtonContainer = styled.div`
    display: flex;
    gap: 10px;
    //margin-left:auto;

    margin-right: auto;
`;

const SortButton = styled.button`
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background-color: ${(props) => (props.active ? '#4F3296' : '#ddd')};
    color: ${(props) => (props.active ? '#fff' : '#666')};
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s;

    &:hover {
        background-color: ${(props) => (props.active ? '#3b2570' : '#bbb')};
    }
`;


    const SelectContainer = styled.div`
        display: flex;
        align-items: center;
        gap: 10px;
    `;

    const StyledSelect = styled.select`
        padding: 8px 16px;
        
        border: thin;
        border-radius: 6px;
        background-color: white;
        color: black;
        font-weight: bold;
        cursor: pointer;
        transition: 0.3s;
        font-size: 14px;
        outline: 3px solid #4F3296; 
        text-align: left;
        text-align-last:center;
        -ms-text-align-last: center;
        -moz-text-align-last: center;
        
    `;


    export default SermonListPage;

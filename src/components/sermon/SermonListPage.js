import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, List, RefreshCcw, ChevronDown } from 'lucide-react';
import { getPublicSermons, getUserSermons } from '../../services/APIService';
import { useUserState } from '../../recoil/utils';
import { useRecoilValue } from 'recoil';
import { isNavExpandedState } from '../../recoil/atoms';

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

const BIBLE_BOOKS = [
    '창세기',
    '출애굽기',
    '레위기',
    '민수기',
    '신명기',
    '여호수아',
    '사사기',
    '룻기',
    '사무엘상',
    '사무엘하',
    '열왕기상',
    '열왕기하',
    '역대상',
    '역대하',
    '에스라',
    '느헤미야',
    '에스더',
    '욥기',
    '시편',
    '잠언',
    '전도서',
    '아가서',
    '이사야',
    '예레미야',
    '예레미야애가',
    '에스겔',
    '다니엘',
    '호세아',
    '요엘',
    '아모스',
    '오바댜',
    '요나',
    '미가',
    '나훔',
    '하박국',
    '스바냐',
    '학개',
    '스가랴',
    '말라기',
    '마태복음',
    '마가복음',
    '누가복음',
    '요한복음',
    '사도행전',
    '로마서',
    '고린도전서',
    '고린도후서',
    '갈라디아서',
    '에베소서',
    '빌립보서',
    '골로새서',
    '데살로니가전서',
    '데살로니가후서',
    '디모데전서',
    '디모데후서',
    '디도서',
    '빌레몬서',
    '히브리서',
    '야고보서',
    '베드로전서',
    '베드로후서',
    '요한일서',
    '요한이서',
    '요한삼서',
    '유다서',
    '요한계시록',
];

const SermonListPage = () => {
    const navigate = useNavigate();
    const [sermons, setSermons] = useState([]);
    const [viewType, setViewType] = useState('grid');
    const [selectedCategory, setSelectedCategory] = useState('public');
    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortBy, setSortBy] = useState('newest');
    const isNavExpanded = useRecoilValue(isNavExpandedState);
    const { userId } = useUserState();
    const [currentPage, setCurrentPage] = useState(1);

    const [filters, setFilters] = useState({
        worshipTypes: [],
        bibleBooks: [],
        authors: [],
    });

    // 날짜 필터 상태 수정
    const [dateFilter, setDateFilter] = useState({
        type: 'single', // 'single' or 'range'
        singleDate: '',
        range: {
            startDate: '',
            endDate: '',
        },
    });

    // expandedFilters 상태를 객체로 변경
    const [expandedFilters, setExpandedFilters] = useState({
        bible: false,
        worship: false,
        date: false,
    });

    // 페이지네이션 계산
    const indexOfLastSermon = currentPage * itemsPerPage;
    const indexOfFirstSermon = indexOfLastSermon - itemsPerPage;
    const currentSermons = sermons.slice(indexOfFirstSermon, indexOfLastSermon);
    const totalPages = Math.ceil(sermons.length / itemsPerPage);

    // 페이지 변경 핸들러
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

    useEffect(() => {
        fetchSermons();
    }, [selectedCategory, sortBy, filters]);

    const fetchSermons = async () => {
        try {
            let response;
            switch (selectedCategory) {
                case 'public':
                    response = await getPublicSermons();
                    break;
                case 'my-all':
                    response = await getUserSermons(userId, 'all');
                    break;
                case 'my-public':
                    response = await getUserSermons(userId, 'public');
                    break;
                case 'my-private':
                    response = await getUserSermons(userId, 'private');
                    break;
                default:
                    response = await getPublicSermons();
            }
            setSermons(response || []);
        } catch (error) {
            console.error('Error fetching sermons:', error);
        }
    };

    const resetFilters = () => {
        setFilters({
            worshipTypes: [],
            bibleBooks: [],
            authors: [],
        });
        setSortBy('newest');
    };

    // 필터 체크박스 토글 함수
    const toggleFilter = (type, value) => {
        setFilters((prev) => {
            const newFilters = { ...prev };
            if (type === 'worshipTypes') {
                if (newFilters.worshipTypes.includes(value)) {
                    newFilters.worshipTypes = newFilters.worshipTypes.filter((item) => item !== value);
                } else {
                    newFilters.worshipTypes = [...newFilters.worshipTypes, value];
                }
            } else if (type === 'bibleBooks') {
                if (newFilters.bibleBooks.includes(value)) {
                    newFilters.bibleBooks = newFilters.bibleBooks.filter((item) => item !== value);
                } else {
                    newFilters.bibleBooks = [...newFilters.bibleBooks, value];
                }
            }
            return newFilters;
        });
    };

    // 아코디언 토글 함수 추가
    const toggleAccordion = (sectionName) => {
        setExpandedFilters((prev) => ({
            ...prev,
            [sectionName]: !prev[sectionName],
        }));
    };

    // 필터 태그 제거 함수
    const removeFilter = (type, value) => {
        setFilters((prev) => ({
            ...prev,
            [type]: prev[type].filter((item) => item !== value),
        }));
    };

    // 날짜 필터 토글 함수
    const toggleDateFilterType = () => {
        setDateFilter((prev) => ({
            ...prev,
            type: prev.type === 'single' ? 'range' : 'single',
        }));
    };

    // 날짜 필터 적용 함수
    const applyDateFilter = () => {
        if (dateFilter.type === 'single' && dateFilter.singleDate) {
            setFilters((prev) => ({
                ...prev,
                dateFilter: {
                    type: 'single',
                    date: dateFilter.singleDate,
                },
            }));
        } else if (dateFilter.type === 'range' && dateFilter.range.startDate && dateFilter.range.endDate) {
            setFilters((prev) => ({
                ...prev,
                dateFilter: {
                    type: 'range',
                    ...dateFilter.range,
                },
            }));
        }
    };

    // 페이지 버튼 렌더링 로직을 별도 함수로 분리
    const renderPageButtons = () => {
        const pageButtons = [];
        const DOTS = '...';
        const SIBLINGS_COUNT = 1; // 현재 페이지 양쪽에 보여줄 페이지 수

        // 첫 페이지 버튼
        pageButtons.push(
            <PageButton onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                {'<<'}
            </PageButton>
        );

        // 이전 페이지 버튼
        pageButtons.push(
            <PageButton onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                {'<'}
            </PageButton>
        );

        // 페이지 번호 버튼들
        if (totalPages <= 7) {
            // 전체 페이지가 7개 이하면 모든 페이지 표시
            for (let i = 1; i <= totalPages; i++) {
                pageButtons.push(
                    <PageButton key={i} onClick={() => handlePageChange(i)} active={currentPage === i}>
                        {i}
                    </PageButton>
                );
            }
        } else {
            // 전체 페이지가 7개 초과면 일부만 표시
            const leftSiblingIndex = Math.max(currentPage - SIBLINGS_COUNT, 1);
            const rightSiblingIndex = Math.min(currentPage + SIBLINGS_COUNT, totalPages);

            const shouldShowLeftDots = leftSiblingIndex > 2;
            const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

            if (!shouldShowLeftDots && shouldShowRightDots) {
                // 왼쪽 dots 없음
                for (let i = 1; i <= 4; i++) {
                    pageButtons.push(
                        <PageButton key={i} onClick={() => handlePageChange(i)} active={currentPage === i}>
                            {i}
                        </PageButton>
                    );
                }
                pageButtons.push(
                    <PageButton key="dots-1" disabled>
                        {DOTS}
                    </PageButton>
                );
                pageButtons.push(
                    <PageButton
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        active={currentPage === totalPages}
                    >
                        {totalPages}
                    </PageButton>
                );
            } else if (shouldShowLeftDots && !shouldShowRightDots) {
                // 오른쪽 dots 없음
                pageButtons.push(
                    <PageButton key={1} onClick={() => handlePageChange(1)} active={currentPage === 1}>
                        1
                    </PageButton>
                );
                pageButtons.push(
                    <PageButton key="dots-1" disabled>
                        {DOTS}
                    </PageButton>
                );
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pageButtons.push(
                        <PageButton key={i} onClick={() => handlePageChange(i)} active={currentPage === i}>
                            {i}
                        </PageButton>
                    );
                }
            } else if (shouldShowLeftDots && shouldShowRightDots) {
                // 양쪽 dots
                pageButtons.push(
                    <PageButton key={1} onClick={() => handlePageChange(1)} active={currentPage === 1}>
                        1
                    </PageButton>
                );
                pageButtons.push(
                    <PageButton key="dots-1" disabled>
                        {DOTS}
                    </PageButton>
                );
                for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
                    pageButtons.push(
                        <PageButton key={i} onClick={() => handlePageChange(i)} active={currentPage === i}>
                            {i}
                        </PageButton>
                    );
                }
                pageButtons.push(
                    <PageButton key="dots-2" disabled>
                        {DOTS}
                    </PageButton>
                );
                pageButtons.push(
                    <PageButton
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        active={currentPage === totalPages}
                    >
                        {totalPages}
                    </PageButton>
                );
            }
        }

        // 다음 페이지 버튼
        pageButtons.push(
            <PageButton onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                {'>'}
            </PageButton>
        );

        // 마지막 페이지 버튼
        pageButtons.push(
            <PageButton onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
                {'>>'}
            </PageButton>
        );

        return pageButtons;
    };

    return (
        <Container isNavExpanded={isNavExpanded}>
            <SearchSection>
                <SearchBar>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="설교 제목, 본문, 작성자 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchBar>
            </SearchSection>

            <ContentWrapper isNavExpanded={isNavExpanded}>
                <FilterSection>
                    <FilterHeader>
                        <h3>필터</h3>
                        <ResetButton onClick={resetFilters}>
                            <RefreshCcw size={14} />
                            초기화
                        </ResetButton>
                    </FilterHeader>

                    <FilterAccordion>
                        <FilterItem>
                            <FilterItemHeader
                                onClick={() => toggleAccordion('bible')}
                                isExpanded={expandedFilters.bible}
                            >
                                <span>성경 구절</span>
                                <ChevronDown
                                    size={20}
                                    style={{
                                        transform: expandedFilters.bible ? 'rotate(180deg)' : 'rotate(0)',
                                        transition: 'transform 0.3s ease',
                                    }}
                                />
                            </FilterItemHeader>
                            <FilterContent isExpanded={expandedFilters.bible}>
                                {BIBLE_BOOKS.map((book) => (
                                    <FilterCheckbox key={book}>
                                        <input
                                            type="checkbox"
                                            checked={filters.bibleBooks.includes(book)}
                                            onChange={() => toggleFilter('bibleBooks', book)}
                                        />
                                        <span>{book}</span>
                                    </FilterCheckbox>
                                ))}
                            </FilterContent>
                        </FilterItem>

                        <FilterItem>
                            <FilterItemHeader
                                onClick={() => toggleAccordion('worship')}
                                isExpanded={expandedFilters.worship}
                            >
                                <span>예배 종류</span>
                                <ChevronDown
                                    size={20}
                                    style={{
                                        transform: expandedFilters.worship ? 'rotate(180deg)' : 'rotate(0)',
                                        transition: 'transform 0.3s ease',
                                    }}
                                />
                            </FilterItemHeader>
                            <FilterContent isExpanded={expandedFilters.worship}>
                                {WORSHIP_TYPES.map((type) => (
                                    <FilterCheckbox key={type}>
                                        <input
                                            type="checkbox"
                                            checked={filters.worshipTypes.includes(type)}
                                            onChange={() => toggleFilter('worshipTypes', type)}
                                        />
                                        <span>{type}</span>
                                    </FilterCheckbox>
                                ))}
                            </FilterContent>
                        </FilterItem>

                        <FilterItem>
                            <FilterItemHeader onClick={() => toggleAccordion('date')} isExpanded={expandedFilters.date}>
                                <span>날짜 기간</span>
                                <ChevronDown
                                    size={20}
                                    style={{
                                        transform: expandedFilters.date ? 'rotate(180deg)' : 'rotate(0)',
                                        transition: 'transform 0.3s ease',
                                    }}
                                />
                            </FilterItemHeader>
                            <FilterContent isExpanded={expandedFilters.date}>
                                <DateFilterContainer>
                                    <DateTypeToggle>
                                        <DateTypeButton
                                            active={dateFilter.type === 'single'}
                                            onClick={() => toggleDateFilterType()}
                                        >
                                            단일 날짜
                                        </DateTypeButton>
                                        <DateTypeButton
                                            active={dateFilter.type === 'range'}
                                            onClick={() => toggleDateFilterType()}
                                        >
                                            기간 설정
                                        </DateTypeButton>
                                    </DateTypeToggle>

                                    {dateFilter.type === 'single' ? (
                                        <DateInput
                                            type="date"
                                            value={dateFilter.singleDate}
                                            onChange={(e) =>
                                                setDateFilter((prev) => ({
                                                    ...prev,
                                                    singleDate: e.target.value,
                                                }))
                                            }
                                        />
                                    ) : (
                                        <DateRangeInput>
                                            <input
                                                type="date"
                                                value={dateFilter.range.startDate}
                                                onChange={(e) =>
                                                    setDateFilter((prev) => ({
                                                        ...prev,
                                                        range: { ...prev.range, startDate: e.target.value },
                                                    }))
                                                }
                                            />
                                            <span>~</span>
                                            <input
                                                type="date"
                                                value={dateFilter.range.endDate}
                                                onChange={(e) =>
                                                    setDateFilter((prev) => ({
                                                        ...prev,
                                                        range: { ...prev.range, endDate: e.target.value },
                                                    }))
                                                }
                                            />
                                        </DateRangeInput>
                                    )}
                                    <ApplyButton onClick={applyDateFilter}>적용</ApplyButton>
                                </DateFilterContainer>
                            </FilterContent>
                        </FilterItem>
                    </FilterAccordion>
                </FilterSection>

                <MainContent>
                    <CategoryTabs>
                        <TabButton active={selectedCategory === 'public'} onClick={() => setSelectedCategory('public')}>
                            공개 설교
                        </TabButton>
                        <TabButton active={selectedCategory === 'my-all'} onClick={() => setSelectedCategory('my-all')}>
                            내 설교 전체
                        </TabButton>
                        <TabButton
                            active={selectedCategory === 'my-public'}
                            onClick={() => setSelectedCategory('my-public')}
                        >
                            내 공개 설교
                        </TabButton>
                        <TabButton
                            active={selectedCategory === 'my-private'}
                            onClick={() => setSelectedCategory('my-private')}
                        >
                            내 비공개 설교
                        </TabButton>
                    </CategoryTabs>

                    <ControlBar>
                        <ActiveFilters>
                            {filters.bibleBooks.map((book) => (
                                <FilterTag key={book}>
                                    <TagText>{book}</TagText>
                                    <RemoveButton onClick={() => removeFilter('bibleBooks', book)}>×</RemoveButton>
                                </FilterTag>
                            ))}
                            {filters.worshipTypes.map((type) => (
                                <FilterTag key={type}>
                                    <TagText>{type}</TagText>
                                    <RemoveButton onClick={() => removeFilter('worshipTypes', type)}>×</RemoveButton>
                                </FilterTag>
                            ))}
                            {filters.dateFilter && (
                                <FilterTag>
                                    <TagText>
                                        {filters.dateFilter.type === 'single'
                                            ? new Date(filters.dateFilter.date).toLocaleDateString()
                                            : `${new Date(
                                                  filters.dateFilter.startDate
                                              ).toLocaleDateString()} ~ ${new Date(
                                                  filters.dateFilter.endDate
                                              ).toLocaleDateString()}`}
                                    </TagText>
                                    <RemoveButton onClick={() => removeFilter('dateFilter')}>×</RemoveButton>
                                </FilterTag>
                            )}
                        </ActiveFilters>
                        <Controls>
                            <SelectWrapper>
                                <Select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                                    <option value={10}>10개씩 보기</option>
                                    <option value={30}>30개씩 보기</option>
                                    <option value={50}>50개씩 보기</option>
                                    <option value={100}>100개씩 보기</option>
                                </Select>
                                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="newest">최신순</option>
                                    <option value="oldest">오래된순</option>
                                    <option value="recently-modified">최근 수정순</option>
                                </Select>
                            </SelectWrapper>
                            <ViewToggle>
                                <ToggleButton active={viewType === 'grid'} onClick={() => setViewType('grid')}>
                                    <LayoutGrid size={20} />
                                </ToggleButton>
                                <ToggleButton active={viewType === 'list'} onClick={() => setViewType('list')}>
                                    <List size={20} />
                                </ToggleButton>
                            </ViewToggle>
                        </Controls>
                    </ControlBar>

                    <SermonList viewType={viewType} isNavExpanded={isNavExpanded}>
                        {currentSermons.length > 0 ? (
                            currentSermons.map((sermon) => (
                                <SermonCard
                                    key={sermon.sermonId}
                                    viewType={viewType}
                                    onClick={() => navigate(`/main/sermon-list/detail/${sermon.sermonId}`)}
                                >
                                    <SermonAuthor>{sermon.ownerName}</SermonAuthor>
                                    <SermonTitle>{sermon.sermonTitle}</SermonTitle>
                                    <SermonInfo>
                                        <Scripture>{sermon.mainScripture}</Scripture>
                                        {sermon.additionalScripture && (
                                            <Scripture>{sermon.additionalScripture}</Scripture>
                                        )}
                                        <WorshipType>{sermon.worshipType}</WorshipType>
                                    </SermonInfo>
                                    <SermonSummary>{sermon.summary}</SermonSummary>
                                </SermonCard>
                            ))
                        ) : (
                            <EmptyState>설교가 없습니다.</EmptyState>
                        )}
                    </SermonList>
                    <Pagination>{renderPageButtons()}</Pagination>
                </MainContent>
            </ContentWrapper>
        </Container>
    );
};

const Container = styled.div`
    padding: 40px 60px;
    width: ${(props) => (props.isNavExpanded ? 'calc(100vw - 320px)' : 'calc(100vw - 120px)')};
    min-height: 91vh;
    background-color: #f8f9fa;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const SearchSection = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 40px;
    width: 100%;
`;

const SearchBar = styled.div`
    display: flex;
    align-items: center;
    padding: 12px 20px;
    width: 100%;
    max-width: 600px;
    background: white;
    border: 1px solid #e1e1e1;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;

    svg {
        color: #6b4ee6;
        margin-right: 12px;
    }

    input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 16px;
        color: #333;
        background: transparent;

        &::placeholder {
            color: #aaa;
        }
    }

    &:focus-within {
        border-color: #6b4ee6;
        box-shadow: 0 0 0 3px rgba(107, 78, 230, 0.1);
    }
`;

const ContentWrapper = styled.div`
    display: grid;
    grid-template-columns: ${(props) => (props.isNavExpanded ? '300px 1fr' : '260px 1fr')};
    gap: 40px;
    transition: all 0.3s ease;
`;

const FilterSection = styled.div`
    background: white;
    padding: 24px;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    height: fit-content;
    transition: all 0.3s ease;
    margin-left: 20px;
    position: sticky;
    top: 20px;
`;

const FilterHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h3 {
        font-size: 18px;
        font-weight: 600;
        color: #333;
    }
`;

const ResetButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: #f8f9fa;
    border: none;
    border-radius: 8px;
    color: #666;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #f1f3f5;
        color: #6b4ee6;
    }

    svg {
        width: 14px;
        height: 14px;
    }
`;

const FilterAccordion = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const FilterItem = styled.div`
    background: white;
    border: 1px solid #e1e1e1;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
        border-color: #6b4ee6;
    }
`;

const FilterItemHeader = styled.button`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 16px;
    background: ${(props) => (props.isExpanded ? '#f8f9fa' : 'white')};
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;

    span {
        font-weight: 600;
        color: ${(props) => (props.isExpanded ? '#6b4ee6' : '#333')};
    }

    &:hover {
        background: #f8f9fa;
    }
`;

const FilterContent = styled.div`
    max-height: ${(props) => (props.isExpanded ? '400px' : '0')};
    opacity: ${(props) => (props.isExpanded ? '1' : '0')};
    overflow-y: ${(props) => (props.isExpanded ? 'auto' : 'hidden')};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: ${(props) => (props.isExpanded ? '16px' : '0')};
    background: white;
    transform-origin: top;
    transform: ${(props) => (props.isExpanded ? 'scaleY(1)' : 'scaleY(0)')};

    /* 체크박스 그리드 레이아웃 */
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;

    /* 날짜 선택기는 그리드 제외 */
    &.date-picker {
        display: block;
    }

    /* 스크롤바 스타일링 */
    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 4px;

        &:hover {
            background: #ccc;
        }
    }
`;

const FilterCheckbox = styled.label`
    display: flex;
    align-items: center;
    padding: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 6px;
    font-size: 13px; // 폰트 크기 약간 감소

    &:hover {
        background: #f8f9fa;
    }

    span {
        white-space: nowrap; // 텍스트 줄바꿈 방지
        overflow: hidden;
        text-overflow: ellipsis;
        padding-left: 24px; // 체크박스 아이콘 공간
    }
`;

const MainContent = styled.div`
    flex: 1;
`;

const ControlBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const ActiveFilters = styled.div`
    display: flex;
    align-items: center;
`;

const FilterTag = styled.span`
    padding: 5px 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-right: 5px;
`;

const TagText = styled.span`
    margin-right: 5px;
`;

const RemoveButton = styled.button`
    padding: 0;
    border: none;
    background: none;
    color: #666;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        color: #6b4ee6;
    }
`;

const Controls = styled.div`
    display: flex;
    align-items: center;
`;

const SelectWrapper = styled.div`
    display: flex;
    gap: 8px;
    margin-right: 10px;
`;

const Select = styled.select`
    padding: 8px 12px;
    border: 1px solid #e1e1e1;
    border-radius: 8px;
    background-color: white;
    color: #333;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: #6b4ee6;
    }

    &:focus {
        outline: none;
        border-color: #6b4ee6;
        box-shadow: 0 0 0 3px rgba(107, 78, 230, 0.1);
    }
`;

const ViewToggle = styled.div`
    display: flex;
    align-items: center;
`;

const ToggleButton = styled.button`
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: ${(props) => (props.active ? '#007bff' : 'transparent')};
    color: ${(props) => (props.active ? '#fff' : '#333')};
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background-color: ${(props) => (props.active ? '#0056b3' : '#f0f0f0')};
    }
`;

const SermonList = styled.div`
    display: ${(props) => (props.viewType === 'grid' ? 'grid' : 'flex')};
    flex-direction: ${(props) => (props.viewType === 'grid' ? 'unset' : 'column')};
    grid-template-columns: ${(props) =>
        props.viewType === 'grid'
            ? props.isNavExpanded
                ? 'repeat(auto-fill, minmax(280px, 1fr))'
                : 'repeat(auto-fill, minmax(300px, 1fr))'
            : 'unset'};
    gap: 24px;
    transition: all 0.3s ease;
`;

const SermonCard = styled.div`
    padding: 20px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    ${(props) =>
        props.viewType === 'list' &&
        `
        display: grid;
        grid-template-columns: 1fr 3fr;
        gap: 20px;
        margin-bottom: 12px;
    `}

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }
`;

const SermonAuthor = styled.div`
    font-size: 14px;
    color: #595c62;
    margin-bottom: 8px;
`;

const SermonTitle = styled.h2`
    font-size: 20px;
    font-weight: 800;
    color: #482895;
    margin-bottom: 10px;
    line-height: 1.3;
`;

const SermonInfo = styled.div`
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;
`;

const Scripture = styled.span`
    font-size: 12px;
    font-weight: 500;
    color: #212a3e;
`;

const WorshipType = styled.span`
    font-size: 10px;
    padding: 4px 8px;
    background: #f8f9fa;
    border-radius: 4px;
    color: #212a3e;
`;

const SermonSummary = styled.p`
    font-size: 13px;
    line-height: 1.5;
    color: #212a3e;
    margin-top: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 48px;
    color: #666;
    font-size: 16px;
    grid-column: 1 / -1;
`;

const Pagination = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
`;

const PageButton = styled.button`
    padding: 8px 16px;
    border: 1px solid ${(props) => (props.active ? '#6b4ee6' : '#e1e1e1')};
    border-radius: 5px;
    background-color: ${(props) => (props.active ? '#6b4ee6' : 'transparent')};
    color: ${(props) => (props.active ? '#fff' : '#333')};
    cursor: pointer;
    margin: 0 4px;
    transition: all 0.3s ease;

    &:hover {
        background-color: ${(props) => (props.active ? '#0056b3' : '#f0f0f0')};
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
`;

const CategoryTabs = styled.div`
    display: flex;
    gap: 12px;
    margin-bottom: 40px;
    padding: 0;
`;

const TabButton = styled.button`
    padding: 12px 24px;
    background: ${(props) => (props.active ? '#6b4ee6' : 'white')};
    color: ${(props) => (props.active ? 'white' : '#666')};
    border: 1px solid ${(props) => (props.active ? '#6b4ee6' : '#e1e1e1')};
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: ${(props) => (props.active ? '0 4px 12px rgba(107, 78, 230, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.05)')};

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(107, 78, 230, 0.15);
    }

    &:active {
        transform: translateY(0);
    }
`;

const DateFilterContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 140px;
    align-items: center;
`;

const DateTypeToggle = styled.div`
    display: flex;
    gap: 8px;
    width: 100%;
`;

const DateTypeButton = styled.button`
    flex: 1;
    padding: 8px 12px;
    border: 1px solid ${(props) => (props.active ? '#6b4ee6' : '#e1e1e1')};
    border-radius: 8px;
    background-color: ${(props) => (props.active ? '#6b4ee6' : 'white')};
    color: ${(props) => (props.active ? 'white' : '#666')};
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${(props) => (props.active ? '#5a3eb8' : '#f8f9fa')};
        border-color: #6b4ee6;
    }
`;

const DateInput = styled.input`
    padding: 12px;
    border: 1px solid #e1e1e1;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
        border-color: #6b4ee6;
        box-shadow: 0 0 0 3px rgba(107, 78, 230, 0.1);
    }
`;

const DateRangeInput = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;

    input {
        padding: 8px 12px;
        border: 1px solid #e1e1e1;
        border-radius: 8px;
        font-size: 13px;
        outline: none;
        transition: all 0.2s ease;

        &:focus {
            border-color: #6b4ee6;
            box-shadow: 0 0 0 3px rgba(107, 78, 230, 0.1);
        }
    }

    span {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 20px;
        color: #666;
        font-size: 12px;
    }
`;

const ApplyButton = styled.button`
    padding: 8px 12px;
    background: #6b4ee6;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;

    &:hover {
        background: #5a3eb8;
        transform: translateY(-2px);
    }

    &:active {
        transform: translateY(0);
    }
`;

export default SermonListPage;

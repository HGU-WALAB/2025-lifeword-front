import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
    Search,
    LayoutGrid,
    List,
    RefreshCcw,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Edit2,
    Trash2,
    BookOpen,
} from 'lucide-react';
import { useUserState } from '../../recoil/utils';
import { useRecoilValue } from 'recoil';
import { isNavExpandedState } from '../../recoil/atoms';
import { getFilteredSermonListAdmin, deleteSermonAdmin, getBookmarks, deleteBookmark } from '../../services/APIService';

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

const ActionButtons = styled.div`
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
`;

const ActionButton = styled.button`
    padding: 8px;
    background: white;
    border: 1px solid #e1e1e1;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: ${(props) => (props.delete ? '#fee' : '#f0f0f0')};
        border-color: ${(props) => (props.delete ? '#ff4444' : '#666')};
        color: ${(props) => (props.delete ? '#ff4444' : '#333')};
    }
`;

const SermonManagementPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { userId } = useUserState();
    const [sermons, setSermons] = useState([]);
    const [viewType, setViewType] = useState(searchParams.get('viewType') || 'grid');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [itemsPerPage, setItemsPerPage] = useState(Number(searchParams.get('perPage')) || 10);
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
    const isNavExpanded = useRecoilValue(isNavExpandedState);
    const [totalPages, setTotalPages] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [sermonToDelete, setSermonToDelete] = useState(null);
    const [selectedSermonUserId, setSelectedSermonUserId] = useState(null);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState(() => {
        return {
            worshipTypes: searchParams.get('worship')?.split(',').filter(Boolean) || [],
            bibleBooks: searchParams.get('bible')?.split(',').filter(Boolean) || [],
            authors: [],
            dateFilter: searchParams.get('dateFilter')
                ? JSON.parse(decodeURIComponent(searchParams.get('dateFilter')))
                : null,
        };
    });

    const [expandedFilters, setExpandedFilters] = useState({
        bible: false,
        worship: false,
        date: false,
    });

    // 검색 관련 상태
    const [activeSearchTerm, setActiveSearchTerm] = useState(searchParams.get('activeSearch') || '');
    const [mainSearchTerm, setMainSearchTerm] = useState(searchParams.get('activeSearch') || '');
    const [filterSearchTerm, setFilterSearchTerm] = useState(searchParams.get('activeSearch') || '');
    const [isScrolled, setIsScrolled] = useState(false);

    const searchInputRef = useRef(null);
    const scrolledSearchInputRef = useRef(null);
    const filterSectionRef = useRef(null);

    const currentSermons = sermons;

    const [tempDateFilter, setTempDateFilter] = useState({
        type: 'single',
        singleDate: '',
        range: {
            startDate: '',
            endDate: '',
        },
    });

    const getSortParam = (sortValue) => {
        switch (sortValue) {
            case 'oldest':
                return 'asc';
            case 'recently-modified':
                return 'recent';
            default:
                return 'desc';
        }
    };

    const fetchSermons = useCallback(
        async (searchKeyword = null) => {
            try {
                setLoading(true);
                const params = {
                    keyword: searchKeyword || searchTerm || null,
                    searchType: searchKeyword || searchTerm ? 2 : null,
                    sort: getSortParam(sortBy),
                    worshipTypes: filters.worshipTypes,
                    scripture: filters.bibleBooks,
                    page: currentPage,
                    size: itemsPerPage,
                    startDate: filters.dateFilter
                        ? filters.dateFilter.type === 'range'
                            ? filters.dateFilter.startDate
                            : filters.dateFilter.date
                        : null,
                    endDate: filters.dateFilter
                        ? filters.dateFilter.type === 'range'
                            ? filters.dateFilter.endDate
                            : filters.dateFilter.date
                        : null,
                };

                const response = await getFilteredSermonListAdmin(params);
                setSermons(response.content);
                setTotalElements(response.totalElements);
                setTotalPages(response.totalPage);
            } catch (error) {
                console.error('Error fetching sermons:', error);
                setSermons([]);
            } finally {
                setLoading(false);
            }
        },
        [sortBy, filters, currentPage, itemsPerPage, searchTerm]
    );

    useEffect(() => {
        fetchSermons();
    }, [fetchSermons]);

    // 검색어 입력 핸들러
    const handleSearchChange = (e) => {
        const newTerm = e.target.value;
        setMainSearchTerm(newTerm);
        setFilterSearchTerm(newTerm);
    };

    // 엔터키 검색 핸들러
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            setCurrentPage(1);
            setActiveSearchTerm(e.target.value);
            setSearchTerm(e.target.value);
            fetchSermons(e.target.value);
        }
    };

    // 검색어 태그 제거 핸들러
    const removeSearchTag = () => {
        setActiveSearchTerm('');
        setSearchTerm('');
        setMainSearchTerm('');
        setFilterSearchTerm('');
        setCurrentPage(1);
        fetchSermons();
    };

    // 스크롤 이벤트 핸들러
    useEffect(() => {
        let lastScrollY = window.scrollY;
        let ticking = false;
        let isTyping = false;

        const handleInputFocus = () => {
            isTyping = true;
        };

        const handleInputBlur = () => {
            isTyping = false;
        };

        if (searchInputRef.current) {
            searchInputRef.current.addEventListener('focus', handleInputFocus);
            searchInputRef.current.addEventListener('blur', handleInputBlur);
        }
        if (scrolledSearchInputRef.current) {
            scrolledSearchInputRef.current.addEventListener('focus', handleInputFocus);
            scrolledSearchInputRef.current.addEventListener('blur', handleInputBlur);
        }

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollThreshold = 200;
                    const buffer = 50;
                    const currentScrollY = window.scrollY;

                    if (currentScrollY > scrollThreshold + buffer && !isScrolled) {
                        setIsScrolled(true);
                    } else if (currentScrollY < scrollThreshold - buffer && isScrolled) {
                        setIsScrolled(false);
                    }

                    if (!isTyping) {
                        const activeElement = document.activeElement;
                        const isSearchFocused =
                            activeElement === searchInputRef.current ||
                            activeElement === scrolledSearchInputRef.current;

                        if (isSearchFocused) {
                            if (isScrolled && scrolledSearchInputRef.current) {
                                scrolledSearchInputRef.current.focus();
                                const len = scrolledSearchInputRef.current.value.length;
                                scrolledSearchInputRef.current.setSelectionRange(len, len);
                            } else if (!isScrolled && searchInputRef.current) {
                                searchInputRef.current.focus();
                                const len = searchInputRef.current.value.length;
                                searchInputRef.current.setSelectionRange(len, len);
                            }
                        }
                    }

                    lastScrollY = currentScrollY;
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (searchInputRef.current) {
                searchInputRef.current.removeEventListener('focus', handleInputFocus);
                searchInputRef.current.removeEventListener('blur', handleInputBlur);
            }
            if (scrolledSearchInputRef.current) {
                scrolledSearchInputRef.current.removeEventListener('focus', handleInputFocus);
                scrolledSearchInputRef.current.removeEventListener('blur', handleInputBlur);
            }
        };
    }, [isScrolled]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
        fetchSermons();
    };

    // 필터 토글 함수
    const toggleFilter = (type, value) => {
        setFilters((prev) => {
            const newFilters = { ...prev };
            if (type === 'worshipTypes' || type === 'bibleBooks') {
                if (newFilters[type].includes(value)) {
                    newFilters[type] = newFilters[type].filter((item) => item !== value);
                } else {
                    newFilters[type] = [...newFilters[type], value];
                }
            }
            return newFilters;
        });
        setCurrentPage(1);
    };

    // 날짜 필터 적용 함수
    const applyDateFilter = async () => {
        let newFilters;
        if (tempDateFilter.type === 'single' && tempDateFilter.singleDate) {
            newFilters = {
                type: 'single',
                date: tempDateFilter.singleDate,
            };
        } else if (tempDateFilter.type === 'range' && tempDateFilter.range.startDate && tempDateFilter.range.endDate) {
            newFilters = {
                type: 'range',
                ...tempDateFilter.range,
            };
        }

        if (newFilters) {
            await setFilters((prev) => ({
                ...prev,
                dateFilter: newFilters,
            }));
            setCurrentPage(1);
            // fetchSermons는 useEffect를 통해 자동으로 호출됩니다
        }
    };

    // 필터 제거 함수
    const removeFilter = (type, value) => {
        if (type === 'dateFilter') {
            setFilters((prev) => ({
                ...prev,
                dateFilter: null,
            }));
            setTempDateFilter({
                type: 'single',
                singleDate: '',
                range: {
                    startDate: '',
                    endDate: '',
                },
            });
        } else {
            setFilters((prev) => ({
                ...prev,
                [type]: prev[type].filter((item) => item !== value),
            }));
        }
        setCurrentPage(1);
    };

    // 필터 초기화 함수
    const resetFilters = () => {
        setFilters({
            worshipTypes: [],
            bibleBooks: [],
            authors: [],
            dateFilter: null,
        });
        setTempDateFilter({
            type: 'single',
            singleDate: '',
            range: {
                startDate: '',
                endDate: '',
            },
        });
        setSortBy('newest');
        setSearchTerm('');
        setMainSearchTerm('');
        setFilterSearchTerm('');
        setActiveSearchTerm('');
        setCurrentPage(1);
        fetchSermons('');
    };

    // 아코디언 토글 함수
    const toggleAccordion = (sectionName) => {
        setExpandedFilters((prev) => ({
            ...prev,
            [sectionName]: !prev[sectionName],
        }));
    };

    // 날짜 입력 핸들러
    const handleSingleDateChange = (e) => {
        setTempDateFilter((prev) => ({
            ...prev,
            singleDate: e.target.value,
        }));
    };

    const handleRangeDateChange = (type, value) => {
        setTempDateFilter((prev) => ({
            ...prev,
            range: {
                ...prev.range,
                [type]: value,
            },
        }));
    };

    // 날짜 필터 토글 함수
    const toggleDateFilterType = () => {
        setTempDateFilter((prev) => ({
            ...prev,
            type: prev.type === 'single' ? 'range' : 'single',
        }));
    };

    const handleDelete = async (sermon) => {
        try {
            // 북마크 상태 확인
            const bookmarksResponse = await getBookmarks(sermon.userId);
            const bookmarkedSermon = bookmarksResponse.sermons.find((b) => b.sermonId === sermon.sermonId);

            // 북마크가 있다면 삭제
            if (bookmarkedSermon) {
                await deleteBookmark(sermon.userId, bookmarkedSermon.bookmarkId);
            }

            // 설교 삭제
            const response = await deleteSermonAdmin(sermon.sermonId, sermon.userId);
            if (response.success) {
                alert('설교가 삭제되었습니다.');
                fetchSermons();
            } else {
                alert('설교 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error deleting sermon:', error);
            alert('설교 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setCurrentPage(1);
        fetchSermons();
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
        fetchSermons();
    };

    useEffect(() => {
        fetchSermons();
    }, [fetchSermons, filters]);

    // URL 파라미터 업데이트 함수
    const updateUrlParams = useCallback(() => {
        const params = new URLSearchParams();

        if (viewType !== 'grid') params.set('viewType', viewType);
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        if (searchTerm) params.set('search', searchTerm);
        if (activeSearchTerm) params.set('activeSearch', activeSearchTerm);
        if (itemsPerPage !== 10) params.set('perPage', itemsPerPage.toString());
        if (sortBy !== 'newest') params.set('sort', sortBy);
        if (currentPage !== 1) params.set('page', currentPage.toString());

        if (filters.worshipTypes.length) params.set('worship', filters.worshipTypes.join(','));
        if (filters.bibleBooks.length) params.set('bible', filters.bibleBooks.join(','));
        if (filters.dateFilter) params.set('dateFilter', encodeURIComponent(JSON.stringify(filters.dateFilter)));

        setSearchParams(params);
    }, [
        viewType,
        selectedCategory,
        searchTerm,
        activeSearchTerm,
        itemsPerPage,
        sortBy,
        currentPage,
        filters,
        setSearchParams,
    ]);

    // URL 파라미터 변경 시 상태 업데이트
    useEffect(() => {
        updateUrlParams();
    }, [
        viewType,
        selectedCategory,
        searchTerm,
        activeSearchTerm,
        itemsPerPage,
        sortBy,
        currentPage,
        filters,
        updateUrlParams,
    ]);

    return (
        <Container isNavExpanded={isNavExpanded}>
            <Header>
                <Title>설교 관리</Title>
                <SearchSection isScrolled={isScrolled}>
                    <SearchBar>
                        <Search size={20} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="설교 제목, 본문, 작성자 검색..."
                            value={mainSearchTerm}
                            onChange={handleSearchChange}
                            onKeyPress={handleKeyPress}
                        />
                    </SearchBar>
                </SearchSection>
            </Header>

            <ContentWrapper isNavExpanded={isNavExpanded}>
                <FilterSection ref={filterSectionRef}>
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
                                    <FilterCheckbox key={book} isDateFilter={false}>
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
                                    <FilterCheckbox key={type} isDateFilter={false}>
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
                                            active={tempDateFilter.type === 'single'}
                                            onClick={toggleDateFilterType}
                                        >
                                            단일 날짜
                                        </DateTypeButton>
                                        <DateTypeButton
                                            active={tempDateFilter.type === 'range'}
                                            onClick={toggleDateFilterType}
                                        >
                                            기간 설정
                                        </DateTypeButton>
                                    </DateTypeToggle>

                                    {tempDateFilter.type === 'single' ? (
                                        <DateInput
                                            type="date"
                                            value={tempDateFilter.singleDate}
                                            onChange={handleSingleDateChange}
                                        />
                                    ) : (
                                        <DateRangeInput>
                                            <input
                                                type="date"
                                                value={tempDateFilter.range.startDate}
                                                onChange={(e) => handleRangeDateChange('startDate', e.target.value)}
                                            />
                                            <span>~</span>
                                            <input
                                                type="date"
                                                value={tempDateFilter.range.endDate}
                                                onChange={(e) => handleRangeDateChange('endDate', e.target.value)}
                                            />
                                        </DateRangeInput>
                                    )}
                                    <ApplyButton onClick={applyDateFilter}>적용</ApplyButton>
                                </DateFilterContainer>
                            </FilterContent>
                        </FilterItem>
                    </FilterAccordion>

                    <FilterDivider />
                    <TotalCountWrapper>
                        <TotalCountIcon>
                            <BookOpen size={14} />
                        </TotalCountIcon>
                        <TotalCount>
                            총 <strong>{totalElements}</strong>개의 설교
                        </TotalCount>
                    </TotalCountWrapper>

                    <ScrolledControls isVisible={isScrolled}>
                        <SearchBar compact isNavExpanded={isNavExpanded}>
                            <Search size={18} />
                            <input
                                ref={scrolledSearchInputRef}
                                type="text"
                                placeholder="설교 제목, 본문, 작성자 검색..."
                                value={filterSearchTerm}
                                onChange={handleSearchChange}
                                onKeyPress={handleKeyPress}
                            />
                        </SearchBar>

                        <Divider />

                        <Controls compact>
                            <SelectWrapper>
                                <Select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                                    <option value={10}>10개씩 보기</option>
                                    <option value={30}>30개씩 보기</option>
                                    <option value={50}>50개씩 보기</option>
                                    <option value={100}>100개씩 보기</option>
                                </Select>
                                <Select value={sortBy} onChange={handleSortChange}>
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
                    </ScrolledControls>
                </FilterSection>

                <MainContent>
                    <ControlBar>
                        <ActiveFilters>
                            {activeSearchTerm && (
                                <FilterTag>
                                    <TagText>검색어: {activeSearchTerm}</TagText>
                                    <RemoveButton onClick={removeSearchTag}>×</RemoveButton>
                                </FilterTag>
                            )}
                            {filters.dateFilter?.type === 'single' && filters.dateFilter.date && (
                                <FilterTag>
                                    <TagText>날짜: {filters.dateFilter.date}</TagText>
                                    <RemoveButton onClick={() => removeFilter('dateFilter')}>×</RemoveButton>
                                </FilterTag>
                            )}
                            {filters.dateFilter?.type === 'range' &&
                                filters.dateFilter.startDate &&
                                filters.dateFilter.endDate && (
                                    <FilterTag>
                                        <TagText>
                                            기간: {filters.dateFilter.startDate} ~ {filters.dateFilter.endDate}
                                        </TagText>
                                        <RemoveButton onClick={() => removeFilter('dateFilter')}>×</RemoveButton>
                                    </FilterTag>
                                )}
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
                        </ActiveFilters>
                        <Controls>
                            <SelectWrapper>
                                <Select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                                    <option value={10}>10개씩 보기</option>
                                    <option value={30}>30개씩 보기</option>
                                    <option value={50}>50개씩 보기</option>
                                    <option value={100}>100개씩 보기</option>
                                </Select>
                                <Select value={sortBy} onChange={handleSortChange}>
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
                        {sermons.length > 0 ? (
                            sermons.map((sermon) => (
                                <SermonCard
                                    key={sermon.sermonId}
                                    viewType={viewType}
                                    onClick={() => navigate(`/main/admin/sermons/detail/${sermon.sermonId}`)}
                                >
                                    <SermonDate>
                                        {new Date(sermon.sermonDate).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </SermonDate>
                                    <SermonTitle>{sermon.sermonTitle}</SermonTitle>
                                    <SermonInfo>
                                        <Scripture>{sermon.mainScripture}</Scripture>
                                        {sermon.additionalScripture && (
                                            <Scripture>{sermon.additionalScripture}</Scripture>
                                        )}
                                        <WorshipType>{sermon.worshipType}</WorshipType>
                                        <ReferenceCount>
                                            <BookOpen size={14} />
                                            {sermon.textCount || 0}개의 버전
                                        </ReferenceCount>
                                    </SermonInfo>
                                    <SermonSummary>{sermon.summary}</SermonSummary>
                                    <ActionButtons>
                                        <ActionButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/main/admin/sermons/edit/${sermon.sermonId}`);
                                            }}
                                        >
                                            <Edit2 size={16} />
                                        </ActionButton>
                                        <ActionButton
                                            delete
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSermonToDelete(sermon);
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </ActionButton>
                                    </ActionButtons>
                                </SermonCard>
                            ))
                        ) : (
                            <EmptyState>설교가 없습니다.</EmptyState>
                        )}
                    </SermonList>
                    <Pagination>
                        <PageButton onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                            <ChevronLeft size={16} />
                            <ChevronLeft size={16} style={{ marginLeft: '-12px' }} />
                        </PageButton>
                        <PageButton onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                            <ChevronLeft size={20} />
                        </PageButton>

                        <PageNumbers>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((page) => {
                                    if (totalPages <= 7) return true;
                                    if (page === 1) return true;
                                    if (page === totalPages) return true;
                                    if (page >= currentPage - 2 && page <= currentPage + 2) return true;
                                    return false;
                                })
                                .map((page, index, array) => {
                                    if (index > 0 && array[index - 1] !== page - 1) {
                                        return (
                                            <React.Fragment key={`ellipsis-${page}`}>
                                                <Ellipsis>...</Ellipsis>
                                                <PageNumber
                                                    active={currentPage === page}
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </PageNumber>
                                            </React.Fragment>
                                        );
                                    }
                                    return (
                                        <PageNumber
                                            key={page}
                                            active={currentPage === page}
                                            onClick={() => handlePageChange(page)}
                                        >
                                            {page}
                                        </PageNumber>
                                    );
                                })}
                        </PageNumbers>

                        <PageButton
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight size={20} />
                        </PageButton>
                        <PageButton onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
                            <ChevronRight size={16} />
                            <ChevronRight size={16} style={{ marginLeft: '-12px' }} />
                        </PageButton>
                    </Pagination>
                </MainContent>
            </ContentWrapper>
            {showDeleteModal && (
                <DeleteModal>
                    <ModalContent>
                        <h3>설교 삭제</h3>
                        <p>정말로 이 설교를 삭제하시겠습니까?</p>
                        <ConfirmButton
                            onClick={() => {
                                handleDelete(sermonToDelete);
                                setShowDeleteModal(false);
                            }}
                        >
                            삭제
                        </ConfirmButton>
                        <CancelButton onClick={() => setShowDeleteModal(false)}>취소</CancelButton>
                    </ModalContent>
                </DeleteModal>
            )}
        </Container>
    );
};

const Container = styled.div`
    padding: 40px 60px;
    min-height: 91vh;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
    flex: 1;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
`;

const Title = styled.h1`
    font-size: 24px;
    font-weight: 800;
    color: #333;
`;

const SearchSection = styled.div`
    display: ${(props) => (props.isScrolled ? 'none' : 'flex')};
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

    ${(props) =>
        props.compact &&
        `
        padding: 4px 8px;
        height: 32px;
        width: ${props.isNavExpanded ? '180px' : '150px'};
        
        input {
            font-size: 12px;
        }
        
        svg {
            width: 14px;
            height: 14px;
            margin-right: 8px;
        }
    `}
`;

const ContentWrapper = styled.div`
    display: grid;
    grid-template-columns: ${(props) => (props.isNavExpanded ? '300px 1fr' : '260px 1fr')};
    gap: 40px;
    transition: all 0.3s ease;
    width: 100%;
`;

const FilterSection = styled.div`
    background: white;
    display: flex;
    flex-direction: column;
    padding: 8px;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #e5e7eb;
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
    padding-left: 10px;
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
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

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
    overflow-x: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: ${(props) => (props.isExpanded ? '16px' : '0')};
    background: white;
    transform-origin: top;
    transform: ${(props) => (props.isExpanded ? 'scaleY(1)' : 'scaleY(0)')};

    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;

    &.date-picker {
        display: block;
        padding: ${(props) => (props.isExpanded ? '16px' : '0')};
    }

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
    padding: 4px 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 6px;
    font-size: 13px;
    white-space: nowrap;
    width: ${(props) => (props.isDateFilter ? 'auto' : '100%')};
    justify-content: flex-start;

    &:hover {
        background: #f8f9fa;
    }

    span {
        padding-left: 20px;
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
    display: flex;
    align-items: center;
    padding: 4px 12px;
    height: 30px;
    background: white;
    border: 1px solid #d9d9d9;
    border-radius: 25px;
    margin-right: 8px;
    transition: all 0.2s ease;

    &:hover {
        border-color: #6b4ee6;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
`;

const TagText = styled.span`
    font-size: 13px;
    color: #333;
    margin-right: 8px;
    font-weight: 500;
`;

const RemoveButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    border: none;
    background: none;
    color: #666;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        color: #6b4ee6;
    }

    svg {
        width: 16px;
        height: 16px;
    }
`;

const Controls = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: space-between;

    ${(props) =>
        props.compact &&
        `
        select {
            font-size: 11px;
            padding: 2px 6px;
            height: 24px;
            max-width: 120px;
        }
    `}
`;

const SelectWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
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
    gap: 4px;
    padding: 2px;
    background: #f8f9fa;
    border-radius: 6px;
    height: 28px;
`;

const ToggleButton = styled.button`
    padding: 8px;
    border: none;
    border-radius: 6px;
    background-color: ${(props) => (props.active ? '#6b4ee6' : 'transparent')};
    color: ${(props) => (props.active ? 'white' : '#666')};
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: ${(props) => (props.active ? '#5a3eb8' : '#e9ecef')};
    }

    svg {
        width: 20px;
        height: 20px;
    }
`;

const SermonList = styled.div`
    display: ${(props) => (props.viewType === 'grid' ? 'grid' : 'flex')};
    flex-direction: ${(props) => (props.viewType === 'grid' ? 'unset' : 'column')};
    grid-template-columns: ${(props) =>
        props.viewType === 'grid'
            ? props.isNavExpanded
                ? 'repeat(auto-fill, minmax(280px, 1fr))'
                : 'repeat(auto-fill, minmax(260px, 1fr))'
            : '1fr'};
    gap: 24px;
    transition: all 0.3s ease;
    width: 100%;
`;

const SermonCard = styled.div`
    ${(props) =>
        props.viewType === 'grid'
            ? `
        min-height: 220px;
        padding: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        border: 1px solid #e5e7eb;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
        gap: 8px;
        position: relative;
    `
            : `
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        border: 1px solid #e5e7eb;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;

        ${SermonDate} {
            font-size: 14px;
            color: #595c62;
            margin-bottom: 8px;
        }

        ${SermonTitle} {
            font-size: 24px;
            font-weight: 800;
            color: #482895;
            margin: 8px 0;
        }

        ${SermonInfo} {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
            margin-top: auto;
        }

        ${Scripture} {
            font-size: 12px;
            font-weight: 500;
            color: #212A3E;
            padding: 4px 8px;
            background: #f8f9fa;
            border-radius: 4px;
            border: 1px solid #e1e1e1;
        }

        ${WorshipType} {
            font-size: 10px;
            padding: 4px 12px;
            background: #eee6ff;
            border: 1px solid #d4c4ff;
            border-radius: 4px;
            color: #482895;
        }

        ${SermonSummary} {
            font-size: 14px;
            line-height: 24px;
            color: #212A3E;
            font-weight: 500;
            margin: 0;
            display: -webkit-box;
            -webkit-line-clamp: 6;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    `}

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-color: #d1d5db;

        ${ActionButtons} {
            opacity: 1;
        }
    }
`;

const SermonDate = styled.div`
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
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-bottom: 16px;
`;

const Scripture = styled.span`
    font-size: 12px;
    font-weight: 500;
    color: #212a3e;
    padding: 4px 8px;
    background: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #e1e1e1;
`;

const WorshipType = styled.span`
    font-size: 10px;
    padding: 4px 12px;
    background: #eee6ff;
    border: 1px solid #d4c4ff;
    border-radius: 4px;
    color: #482895;
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
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 6px;
    border: 1px solid #e1e1e1;
    border-radius: 6px;
    background-color: white;
    color: #333;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background-color: #f8f9fa;
        border-color: #6b4ee6;
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
`;

const PageNumbers = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
`;

const PageNumber = styled.button`
    min-width: 32px;
    height: 32px;
    padding: 0 6px;
    border: 1px solid ${(props) => (props.active ? '#6b4ee6' : '#e1e1e1')};
    border-radius: 6px;
    background-color: ${(props) => (props.active ? '#6b4ee6' : 'white')};
    color: ${(props) => (props.active ? 'white' : '#333')};
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${(props) => (props.active ? '#5a3eb8' : '#f8f9fa')};
        border-color: #6b4ee6;
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
`;

const Ellipsis = styled.span`
    color: #666;
    padding: 0 4px;
`;

const DeleteModal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ModalContent = styled.div`
    background-color: white;
    padding: 24px;
    border-radius: 12px;
    width: 300px;
    text-align: center;

    h3 {
        margin-bottom: 16px;
        color: #333;
    }

    p {
        margin-bottom: 24px;
        color: #666;
    }
`;

const ConfirmButton = styled.button`
    padding: 8px 16px;
    background-color: #ff4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-right: 8px;

    &:hover {
        background-color: #ff2222;
    }
`;

const CancelButton = styled.button`
    padding: 8px 16px;
    background-color: #666;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;

    &:hover {
        background-color: #444;
    }
`;

const ScrolledControls = styled.div`
    position: static;
    background: white;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: ${(props) => (props.isVisible ? 'flex' : 'none')};
`;

const Divider = styled.hr`
    border: none;
    height: 1px;
    background-color: #e5e7eb;
    margin: 0;
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
    width: 67%;

    &:hover {
        background: #5a3eb8;
        transform: translateY(-2px);
    }

    &:active {
        transform: translateY(0);
    }
`;

const ReferenceCount = styled.span`
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #6b4ee6;
    background: #f8f9fa;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #e9ecef;

    svg {
        color: #6b4ee6;
    }
`;

const FilterDivider = styled.div`
    height: 1px;
    background-color: #e5e7eb;
    margin: 16px 0;
`;

const TotalCountWrapper = styled.div`
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f8f9fa;
    border-radius: 8px;
    margin: 0 4px;
`;

const TotalCountIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b4ee6;
`;

const TotalCount = styled.div`
    font-size: 14px;
    color: #666;

    strong {
        color: #6b4ee6;
        font-weight: 600;
        margin: 0 2px;
    }
`;

export default SermonManagementPage;

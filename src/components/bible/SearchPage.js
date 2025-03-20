import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchBibles } from '../../services/APIService';
import VerseContextMenu from './VerseContextMenu';
import LoadingSpinner from '../common/LoadingSpinner';

const ITEMS_PER_PAGE = 20;

const SearchPage = () => {
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasSearched, setHasSearched] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();
    const RESULTS_PER_PAGE = 20;

    //BubbleText 4 초
    const [showBubble, setShowBubble] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowBubble(false);
        }, 4000);
        return () => clearTimeout(timer);
    }, []);

    const lastResultElementRef = useCallback(
        (node) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage((prevPage) => prevPage + 1);
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, hasMore]
    );

    const handleSearch = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setPage(1);
        setLoading(true);
        try {
            const response = await searchBibles(keyword);
            if (response.success) {
                const highlightedData = response.data.map((result) => ({
                    ...result,
                    highlightedSentence: highlightText(result.sentence, keyword),
                }));
                setSearchResults(highlightedData);
                setHasMore(highlightedData.length > RESULTS_PER_PAGE);
            } else {
                setSearchResults([]);
                setHasMore(false);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
            setHasMore(false);
        } finally {
            setLoading(false);
            setHasSearched(true);
        }
    };

    const highlightText = (text, keyword) => {
        if (!keyword) return text;
        const regex = new RegExp(`(${keyword})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, index) =>
            part.toLowerCase() === keyword.toLowerCase() ? <HighlightedText key={index}>{part}</HighlightedText> : part
        );
    };

    const totalPages = Math.ceil(searchResults.length / ITEMS_PER_PAGE);

    const currentResults = searchResults.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;
        range.push(1);
        for (let i = currentPage - delta; i <= currentPage + delta; i++) {
            if (i > 1 && i < totalPages) range.push(i);
        }
        range.push(totalPages);
        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }
        return rangeWithDots;
    };

    const displayedResults = searchResults.slice(0, page * RESULTS_PER_PAGE);

    useEffect(() => {
        handleSearch();
    }, []);

    return (
        <Container>
            <SearchBar bubbleVisible={showBubble}>
                {showBubble && <BubbleText visible={showBubble}>찾고싶은 성경구절을 검색해 보세요!</BubbleText>}
                <SearchForm onSubmit={handleSearch}>
                    <SearchInputGroup>
                        <SearchInput
                            type="text"
                            value={keyword}
                            onChange={(e) => {
                                setKeyword(e.target.value);
                                setHasSearched(false);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSearch(e);
                                }
                            }}
                            placeholder="성경 구절을 검색하세요 (예: 창 1:1, 창세기 1장, 사랑)"
                        />

                        {keyword && (
                            <ClearButton onClick={() => setKeyword('')}>
                                <X size={20} />
                            </ClearButton>
                        )}

                        <SearchButton type="submit" disabled={loading}>
                            <Search size={24} />
                        </SearchButton>
                    </SearchInputGroup>
                </SearchForm>
            </SearchBar>

            <ResultsWrapper>
                <ResultsContainer>
                    {loading && page === 1 ? (
                        <LoadingSpinner text="검색 결과를 불러오는 중..." />
                    ) : searchResults.length > 0 ? (
                        <>
                            {displayedResults.map((result, index) => {
                                if (displayedResults.length === index + 1) {
                                    return <ResultItem ref={lastResultElementRef} key={result.idx} result={result} />;
                                } else {
                                    return <ResultItem key={result.idx} result={result} />;
                                }
                            })}
                            {loading && page > 1 && <LoadingSpinner text="더 불러오는 중..." />}
                        </>
                    ) : (
                        hasSearched && (
                            <EmptyText>
                                {keyword ? `검색어 "${keyword}"는 없습니다.` : '검색 결과가 없습니다.'}
                            </EmptyText>
                        )
                    )}
                </ResultsContainer>
            </ResultsWrapper>
        </Container>
    );
};

const Container = styled.div`
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: white;
`;

const SearchBar = styled.div`
    align-self: flex-start;
    display: flex;
    flex-direction: column;
    padding: ${(props) => (props.bubbleVisible ? '40px 0 0 15%' : '90px 0 0 15%')};
    width: 35%;
    max-width: 600px;
    background: white;
`;

const SearchForm = styled.form`
    width: 100%;
    display: flex;
    flex-direction: column;
`;

const SearchInputGroup = styled.div`
    display: flex;
    align-items: center;
    position: relative;
`;

const SearchInput = styled.input`
    flex: 1;
    padding: 12px 50px 12px 24px;
    /* Use the hasValue prop to change the border color dynamically */
    border: 2px solid ${(props) => (props.hasValue ? '#ff4444' : '#4f3296')};
    border-radius: 25px;
    font-size: 14px;
    transition: border-color 0.2s ease;
    &::placeholder {
        color: #999;
    }
    &:focus {
        border-color: ${(props) => (props.hasValue ? '#ff4444' : '#6b4ee6')};
        outline: none;
    }
    &:focus-within {
        border-color: #6b4ee6;
        box-shadow: 0 0 0 3px rgba(107, 78, 230, 0.1);
    }
`;

const ClearButton = styled.button`
    position: absolute;
    right: 50px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding-right: 20px;
    color: #999;
    transition: color 0.2s ease;
    &:hover {
        color: #333;
    }
`;

const SearchButton = styled.button`
    width: 42px;
    height: 42px;
    margin-left: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    color: #4f3296;
    background-color: transparent;
    cursor: pointer;
    transition: background-color 0.2s ease;
    &:hover {
        color: #6b4ee6;
        background-color: rgba(163, 163, 163, 0.31);
    }
`;

// 찬고싶은 성경구절
const BubbleText = styled.div`
    height: 20px;
    position: relative;
    left: -16px;
    margin-bottom: 15px;
    font-size: 14px;
    color: #4f3296;
    padding: 8px 12px;
    background-color: #ecdfff;
    border-radius: 24px;
    align-self: flex-start;
    display: inline-block;
    transform: ${(props) => (props.bubbleVisible ? 'translateY(0)' : 'translateY(-10px)')};
    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
    &::after {
        // 말풍선 꼬랑지
        content: '';
        position: absolute;
        bottom: -10px;
        left: 20px;
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 10px solid #ecdfff;
    }
`;

const ResultsWrapper = styled.div`
    position: relative;
    width: 70%;
    height: 70%;
    margin: 20px 0;
`;

const ResultsContainer = styled.div`
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const ResultItemContainer = styled.div`
    position: relative;
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid #ececec;
`;

const ResultHeader = styled.div`
    color: #482895;
    font-weight: 600;
    margin-bottom: 8px;
`;

const ResultContent = styled.div`
    line-height: 1.6;
`;

const HighlightedText = styled.span`
    font-weight: bold;
    color: #482895;
    background-color: #ecdfff;
    padding: 1px;
`;

const EmptyText = styled.div`
    width: 60%;
    text-align: left;
    padding: 0 0 0 0;
    color: #666666;
`;

const ResultItem = React.forwardRef(({ result }, ref) => {
    const resultRef = useRef(null);
    return (
        <ResultItemContainer ref={ref || resultRef}>
            <ResultHeader>
                {result.long_label} {result.chapter}장 {result.paragraph}절
            </ResultHeader>
            <ResultContent>{result.highlightedSentence}</ResultContent>
            <VerseContextMenu targetRef={ref || resultRef} verse={result} />
        </ResultItemContainer>
    );
});

export default SearchPage;

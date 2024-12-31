import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchBibles } from '../services/APIService';
import VerseContextMenu from './VerseContextMenu';

const ITEMS_PER_PAGE = 20;

const SearchPage = () => {
    const [searchMode, setSearchMode] = useState('verse');
    const [keyword1, setKeyword1] = useState('');
    const [keyword2, setKeyword2] = useState('');
    const [operator, setOperator] = useState('AND');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await searchBibles(
                searchMode,
                keyword1,
                searchMode === 'verse' ? keyword2 : null,
                searchMode === 'verse' ? operator : null
            );
            if (response.success) {
                setSearchResults(response.response_object);
                setCurrentPage(1);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
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
            if (i > 1 && i < totalPages) {
                range.push(i);
            }
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

    return (
        <Container>
            <SearchContainer>
                <SearchForm onSubmit={handleSearch}>
                    <SearchModeSelect
                        value={searchMode}
                        onChange={(e) => {
                            setSearchMode(e.target.value);
                            setKeyword2('');
                            setOperator('AND');
                        }}
                    >
                        <option value="verse">구절 검색 모드</option>
                        <option value="reference">장절 검색 모드</option>
                        <option value="word">단어 검색 모드</option>
                    </SearchModeSelect>

                    <SearchInputGroup>
                        <SearchInput
                            type="text"
                            value={keyword1}
                            onChange={(e) => setKeyword1(e.target.value)}
                            placeholder={
                                searchMode === 'verse'
                                    ? '첫 번째 검색어를 입력하세요'
                                    : searchMode === 'reference'
                                    ? '예: 창 1:1 또는 창세기 1장 1절'
                                    : '검색할 단어를 입력하세요'
                            }
                        />

                        {searchMode === 'verse' && (
                            <>
                                <OperatorSelect value={operator} onChange={(e) => setOperator(e.target.value)}>
                                    <option value="AND">그리고</option>
                                    <option value="OR">또는</option>
                                </OperatorSelect>

                                <SearchInput
                                    type="text"
                                    value={keyword2}
                                    onChange={(e) => setKeyword2(e.target.value)}
                                    placeholder="두 번째 검색어를 입력하세요"
                                />
                            </>
                        )}

                        <SearchButton type="submit" disabled={loading}>
                            <Search size={20} />
                            찾기
                        </SearchButton>
                    </SearchInputGroup>
                </SearchForm>
            </SearchContainer>

            <ResultsContainer>
                {loading ? (
                    <LoadingText>검색 중...</LoadingText>
                ) : (
                    currentResults.map((result) => <ResultItem key={result.idx} result={result} />)
                )}
            </ResultsContainer>

            {totalPages > 1 && (
                <PaginationContainer>
                    <PaginationButton
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={20} />
                    </PaginationButton>

                    <PageNumbers>
                        {getVisiblePages().map((page, index) => (
                            <PageButton
                                key={index}
                                active={currentPage === page}
                                onClick={() => (typeof page === 'number' ? setCurrentPage(page) : null)}
                                disabled={typeof page !== 'number'}
                            >
                                {page}
                            </PageButton>
                        ))}
                    </PageNumbers>

                    <PaginationButton
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight size={20} />
                    </PaginationButton>
                </PaginationContainer>
            )}
        </Container>
    );
};

const Container = styled.div`
    margin-left: 280px;
    width: calc(100vw - 280px);
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f5f5f5;
    overflow-y: hidden;
`;

const SearchContainer = styled.div`
    width: 100%;
    max-width: 800px;
    margin-top: 50px;
    margin-bottom: 20px;
`;

const SearchForm = styled.form`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const SearchInputGroup = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
`;

const SearchModeSelect = styled.select`
    width: 200px;
    padding: 12px 16px;
    border: 2px solid #4f3296;
    border-radius: 25px;
    background-color: white;
    color: #4f3296;
    font-size: 14px;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234F3296' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px;

    &:focus {
        outline: none;
        border-color: #3a2570;
    }
`;

const SearchInput = styled.input`
    flex: 1;
    padding: 12px 20px;
    border: 2px solid #4f3296;
    border-radius: 25px;
    font-size: 14px;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #3a2570;
    }

    &::placeholder {
        color: #999;
    }
`;

const OperatorSelect = styled(SearchModeSelect)`
    width: 120px;
`;

const SearchButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background-color: #4f3296;
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: #3a2570;
    }

    &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
`;

const ResultsContainer = styled.div`
    width: 100%;
    max-width: 800px;
    height: calc(100vh - 300px);
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
    padding-right: 16px;
`;

const ResultItem = ({ result }) => {
    const resultRef = useRef(null);

    return (
        <ResultItemContainer ref={resultRef}>
            <ResultHeader>
                {result.long_label} {result.chapter}장 {result.paragraph}절
            </ResultHeader>
            <ResultContent>{result.sentence}</ResultContent>
            <VerseContextMenu targetRef={resultRef} verse={result} />
        </ResultItemContainer>
    );
};

const ResultItemContainer = styled.div`
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
`;

const ResultHeader = styled.div`
    color: #4f3296;
    font-weight: 600;
    margin-bottom: 8px;
`;

const ResultContent = styled.div`
    line-height: 1.6;
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

const LoadingText = styled.div`
    text-align: center;
    padding: 20px;
    color: #666666;
`;

export default SearchPage;

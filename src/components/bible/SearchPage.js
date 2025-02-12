import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { searchBibles } from "../../services/APIService";
import VerseContextMenu from "./VerseContextMenu";

const ITEMS_PER_PAGE = 20;

const SearchPage = () => {
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  //BubbleText 4 초
  const [showBubble, setShowBubble] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBubble(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const response = await searchBibles(keyword);
      if (response.success) {
        const highlightedData = response.data.map((result) => ({
          ...result,
          highlightedSentence: highlightText(result.sentence, keyword),
        }));
        setSearchResults(highlightedData);
        setCurrentPage(1);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const highlightText = (text, keyword) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <HighlightedText key={index}>{part}</HighlightedText>
      ) : (
        part
      )
    );
  };

  const totalPages = Math.ceil(searchResults.length / ITEMS_PER_PAGE);

  const currentResults = searchResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <Container>
      <SearchBar bubbleVisible={showBubble}>
        {showBubble && (
          <BubbleText visible={showBubble}>
            찾고싶은 성경구절을 검색해 보세요!
          </BubbleText>
        )}
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
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch(e);
                }
              }}
              placeholder="성경 구절을 검색하세요 (예: 창 1:1, 창세기 1장, 사랑)"
            />

            {keyword && (
              <ClearButton onClick={() => setKeyword("")}>
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
          {loading ? (
            <LoadingText>로딩 중...</LoadingText>
          ) : searchResults.length > 0 ? (
            currentResults.map((result) => (
              <ResultItem key={result.idx} result={result} />
            ))
          ) : (
            hasSearched && (
              <EmptyText>
                {keyword
                  ? `검색어 "${keyword}"는 없습니다.`
                  : "검색 결과가 없습니다."}
              </EmptyText>
            )
          )}
        </ResultsContainer>
      </ResultsWrapper>

      {totalPages > 1 && (
        <PaginationContainer>
          <PaginationButton
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={24} />
          </PaginationButton>

          <PageNumbers>
            {getVisiblePages().map((page, index) => (
              <PageButton
                key={index}
                active={currentPage === page}
                onClick={() =>
                  typeof page === "number" ? setCurrentPage(page) : null
                }
                disabled={typeof page !== "number"}
              >
                {page}
              </PageButton>
            ))}
          </PageNumbers>

          <PaginationButton
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={24} />
          </PaginationButton>
        </PaginationContainer>
      )}
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
  padding: ${(props) =>
    props.bubbleVisible ? "40px 0 0 15%" : "90px 0 0 15%"};
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
  border: 2px solid #4f3296;
  border-radius: 25px;
  font-size: 14px;
  transition: all 0.2s ease;

  &::placeholder {
    color: #999;
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
  transform: ${(props) =>
    props.bubbleVisible ? "translateY(0)" : "translateY(-10px)"};
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  &::after {
    // 말풍선 꼬랑지
    content: "";
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

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: rgb(255, 255, 255);
  border: 1px solid #ececec;
  max-width: 800px;
  justify-content: center;
  border-radius: 50px;
  padding: 5px 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PaginationButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background-color: transparent;
  color: ${(props) => (props.disabled ? "#999" : "#482895")};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  &:hover:not(:disabled) {
    background-color: #f5f5f5;
  }
  svg {
    stroke-width: ${({ disabled }) => (disabled ? 1 : 2)};
  }
`;

const PageNumbers = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
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
  background-color: ${(props) => (props.active ? "#4F3296" : "#f5f5f5")};
  color: ${(props) =>
    props.active ? "white" : props.disabled ? "#999" : "#333"};
  cursor: ${(props) => (props.disabled ? "default" : "pointer")};
  transition: all 0.2s ease;
  font-size: 14px;
  &:hover {
    background-color: ${(props) => {
      if (props.disabled) return "#f5f5f5";
      return props.active ? "#3a2570" : "#e5e5e5";
    }};
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 20px;
  color: #666666;
`;

const EmptyText = styled.div`
  width: 60%;
  text-align: left;
  padding: 0 0 0 0;
  color: #666666;
`;

const ResultItem = ({ result }) => {
  const resultRef = useRef(null);
  return (
    <ResultItemContainer ref={resultRef}>
      <ResultHeader>
        {result.long_label} {result.chapter}장 {result.paragraph}절
      </ResultHeader>
      <ResultContent>{result.highlightedSentence}</ResultContent>
      <VerseContextMenu targetRef={resultRef} verse={result} />
    </ResultItemContainer>
  );
};

export default SearchPage;

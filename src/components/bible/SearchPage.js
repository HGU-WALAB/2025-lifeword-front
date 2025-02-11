import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { searchBibles } from "../../services/APIService";
import VerseContextMenu from "./VerseContextMenu";

const ITEMS_PER_PAGE = 20;

const SearchPage = () => {
  // State variables for the search keyword, results, loading status, pagination, and whether a search has been made
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  // Function to handle searching; triggered on form submission or Enter key press
  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault(); // Prevent default form submission behavior
    setLoading(true);
    try {
      // Call the search API with the current keyword
      const response = await searchBibles(keyword);
      if (response.success) {
        // Map over results to highlight the search keyword in the sentence
        const highlightedData = response.data.map((result) => ({
          ...result,
          highlightedSentence: highlightText(result.sentence, keyword),
        }));
        setSearchResults(highlightedData);
        setCurrentPage(1); // Reset pagination to the first page
      } else {
        setSearchResults([]); // Clear results if API response indicates failure
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
      setHasSearched(true); // Mark that a search has been performed
    }
  };

  // Function to highlight occurrences of the search keyword within the given text
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

  // Calculate total pages based on the number of search results and items per page
  const totalPages = Math.ceil(searchResults.length / ITEMS_PER_PAGE);
  // Slice the search results to show only the results for the current page
  const currentResults = searchResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Function to generate visible page numbers for pagination with dots for skipped ranges
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

  // Trigger an initial search when the component mounts (showing results for an empty keyword)
  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <Container>
      {/* Search bar section */}
      <SearchBar>
        <BubbleText>찾고싶은 성경구절을 찾아보세요!</BubbleText>
        <SearchForm onSubmit={handleSearch}>
          <SearchInputGroup>
            <SearchInput
              type="text"
              value={keyword}
              // On change, update the keyword and reset the hasSearched flag to hide empty result messages
              onChange={(e) => {
                setKeyword(e.target.value);
                setHasSearched(false);
              }}
              // Handle Enter key press to trigger search
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch(e);
                }
              }}
              placeholder="성경 구절을 검색하세요 (예: 창 1:1, 창세기 1장, 사랑)"
            />
            {/* Clear button appears when there is a keyword */}
            {keyword && (
              <ClearButton onClick={() => setKeyword("")}>
                <X size={20} />
              </ClearButton>
            )}
            {/* Search button */}
            <SearchButton type="submit" disabled={loading}>
              <Search size={24} />
            </SearchButton>
          </SearchInputGroup>
        </SearchForm>
      </SearchBar>

      {/* ResultsWrapper holds the scrollable results and the fixed gradient overlay */}
      <ResultsWrapper>
        <ResultsContainer>
          {loading ? (
            <LoadingText>로딩 중...</LoadingText>
          ) : searchResults.length > 0 ? (
            // Map current results to individual result items
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
        {/* Gradient overlay fixed at the bottom of the results area */}
        <GradientOverlay />
      </ResultsWrapper>

      {/* Pagination controls (only shown if there are multiple pages) */}
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
  padding: 40px 0 0 15%;
  width: 35%;
  max-width: 600px;
  background: white;
  transition: all 0.2s ease;
`;

// Form container for the search input
const SearchForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

// Container for the search input, clear button, and search button
const SearchInputGroup = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

// Styled search input with focus styles and placeholder color
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

// Clear button that appears inside the input to clear the keyword
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

// Search button styled as a circular icon button
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

// Bubble text that prompts the user to search for a Bible verse
const BubbleText = styled.div`
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
  padding-right: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// Gradient overlay fixed at the bottom of the results wrapper
const GradientOverlay = styled.div`
  position: absolute;
  padding: 10;
  bottom: 0;
  left: 0;
  right: 0;
  height: 24px; /* Adjust height as needed */
  background: linear-gradient(to top, #c1c1c1, transparent);
  pointer-events: none;
  z-index: 1000;
`;

// Container for each individual result item
const ResultItemContainer = styled.div`
  position: relative;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #ececec;
`;

// Header for a result item (e.g., the Bible reference)
const ResultHeader = styled.div`
  color: #482895;
  font-weight: 600;
  margin-bottom: 8px;
`;

// Content of the result item
const ResultContent = styled.div`
  line-height: 1.6;
`;

// Styled text used for highlighting the search keyword within results
const HighlightedText = styled.span`
  font-weight: bold;
  color: #482895;
  background-color: #ecdfff;
  padding: 1px;
`;

// Container for the pagination controls
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

// Individual pagination button styling
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

// Container for page numbers in pagination
const PageNumbers = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 4px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

// Styling for each individual page button
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

// Loading text styling
const LoadingText = styled.div`
  text-align: center;
  padding: 20px;
  color: #666666;
`;

// Empty text styling for no results
const EmptyText = styled.div`
  width: 60%;
  text-align: left;
  padding: 0 0 0 0;
  color: #666666;
`;

// Component for an individual result item, including the context menu
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

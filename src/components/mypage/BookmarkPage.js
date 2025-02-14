import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { getBookmarks, deleteBookmark } from "../../services/APIService";
import { useUserState } from "../../recoil/utils";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 20;

const BookmarkPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSermonView, setIsSermonView] = useState(false);
  const { userId } = useUserState();
  const navigate = useNavigate();

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const response = await getBookmarks(userId);
      if (response.success) {
        setBookmarks(isSermonView ? response.sermons : response.verses);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [userId, isSermonView]);

  const handleDeleteBookmark = async (bookmark) => {
    if (!window.confirm("이 북마크를 삭제하시겠습니까?")) {
      return;
    }
    try {
      const response = await deleteBookmark(userId, bookmark.bookmarkId);
      if (response.success) {
        alert("북마크가 삭제되었습니다.");
        await fetchBookmarks();
        const newTotalPages = Math.ceil(
          (bookmarks.length - 1) / ITEMS_PER_PAGE
        );
        if (currentPage > newTotalPages) {
          setCurrentPage(Math.max(1, newTotalPages));
        }
      }
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      alert("북마크 삭제에 실패했습니다.");
    }
  };

  const handleSermonClick = (sermonId) => {
    navigate(`/main/mypage/sermon/${sermonId}`);
  };

  const totalPages = Math.ceil(bookmarks.length / ITEMS_PER_PAGE);
  const currentBookmarks = bookmarks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getVisiblePages = () => {
    if (totalPages <= 11) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    for (let i = 1; i <= 5; i++) {
      pages.push(i);
    }
    pages.push("...");
    for (let i = totalPages - 4; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <Container>
      <TitleContainer>
        <SmallText>북마크</SmallText>
        <TitleRow>
          <StrongText>
            즐겨찾는&nbsp;
            <ChangeText>{isSermonView ? "설교" : "구절"}</ChangeText>
          </StrongText>
          <ButtonGroup>
            <ToggleButton
              onClick={() => setIsSermonView(false)}
              active={!isSermonView}
            >
              성경 구절
            </ToggleButton>
            <ToggleButton
              onClick={() => setIsSermonView(true)}
              active={isSermonView}
            >
              설교
            </ToggleButton>
          </ButtonGroup>
        </TitleRow>
      </TitleContainer>

      <ResultsContainer>
        {loading ? (
          <LoadingText>북마크를 불러오는 중...</LoadingText>
        ) : currentBookmarks.length === 0 ? (
          <EmptyText>저장된 북마크가 없습니다.</EmptyText>
        ) : (
          currentBookmarks.map((bookmark) => (
            <ResultItem
              key={bookmark.bookmarkId}
              onClick={() =>
                isSermonView ? handleSermonClick(bookmark.sermonId) : null
              }
              clickable={isSermonView}
            >
              <ResultContent>
                <ResultHeader>
                  {isSermonView ? (
                    <>
                      {bookmark.sermonTitle}
                      <SermonMeta>
                        {bookmark.mainScripture}
                        {bookmark.additionalScripture &&
                          ` | ${bookmark.additionalScripture}`}
                        {bookmark.worshipType && ` | ${bookmark.worshipType}`}
                      </SermonMeta>
                    </>
                  ) : (
                    <>
                      {bookmark.longLabel} {bookmark.chapter}장{" "}
                      {bookmark.paragraph}절
                    </>
                  )}
                </ResultHeader>
                <VerseText>
                  {isSermonView ? bookmark.summary : bookmark.sentence}
                </VerseText>
              </ResultContent>
              <DeleteButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBookmark(bookmark);
                }}
                aria-label="북마크 삭제"
              >
                <Trash2 size={20} />
              </DeleteButton>
            </ResultItem>
          ))
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
            <ChevronRight size={20} />
          </PaginationButton>
        </PaginationContainer>
      )}
    </Container>
  );
};

export default BookmarkPage;

const Container = styled.div`
  max-width: 80%;
  margin: 0 auto;
  background-color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TitleContainer = styled.div`
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const ToggleButton = styled.button`
  background-color: ${(props) => (props.active ? "#6b4ee6" : "transparent")};
  color: ${(props) => (props.active ? "white" : "#666")};
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease;
  border: 1px solid #ececec;
  &:hover {
    background-color: ${(props) => (props.active ? "#5a3eb8" : "#e9ecef")};
  }
`;

const SmallText = styled.div`
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  font-size: 24px;
  line-height: 140%;
  color: #757575;
`;

const StrongText = styled.div`
  display: flex;
  font-family: "Inter";
  font-style: normal;
  font-weight: 600;
  font-size: 42px;
  line-height: 140%;
  color: #1e1e1e;
`;
const ChangeText = styled.div`
  font-family: "Inter";
  font-style: normal;
  font-weight: 600;
  font-size: 42px;
  color: #4f3296;
`;

const ResultsContainer = styled.div`
  width: 100%;
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
`;

const ResultItem = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ececec;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  cursor: ${(props) => (props.clickable ? "pointer" : "default")};
  transition: all 0.2s ease;

  &:hover {
    transform: ${(props) => (props.clickable ? "translateY(-2px)" : "none")};
    box-shadow: ${(props) =>
      props.clickable
        ? "0 4px 12px rgba(0, 0, 0, 0.1)"
        : "0 2px 4px rgba(0, 0, 0, 0.1)"};
  }
`;

const ResultContent = styled.div`
  flex: 1;
`;

const ResultHeader = styled.div`
  color: #4f3296;
  font-weight: 600;
  margin-bottom: 8px;
`;

const VerseText = styled.div`
  line-height: 1.6;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  color: #666;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
  &:hover {
    color: #ef4444;
    background-color: rgba(239, 68, 68, 0.1);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  background-color: #f5f5f5;
  width: 100%;
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
  background-color: ${(props) => (props.disabled ? "#f5f5f5" : "#4F3296")};
  color: ${(props) => (props.disabled ? "#999" : "white")};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  &:hover:not(:disabled) {
    background-color: #3a2570;
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

const EmptyText = styled(LoadingText)`
  color: #999;
`;

const SermonMeta = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  font-weight: normal;
`;

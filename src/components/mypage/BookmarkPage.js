import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { getBookmarks, deleteBookmark } from '../../services/APIService';
import { useUserState } from '../../recoil/utils';

const ITEMS_PER_PAGE = 20;

const BookmarkPage = () => {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const { userId } = useUserState();

    const fetchBookmarks = async () => {
        setLoading(true);
        try {
            const response = await getBookmarks(userId);
            if (response.success) {
                setBookmarks(response.data);
            }
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, [userId]);

    const handleDeleteBookmark = async (bookmark) => {
        if (!window.confirm('이 북마크를 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await deleteBookmark(userId, bookmark.verse_id);
            if (response.success) {
                alert('북마크가 삭제되었습니다.');
                await fetchBookmarks();

                // 현재 페이지의 아이템이 없으면 이전 페이지로 이동
                const newTotalPages = Math.ceil((bookmarks.length - 1) / ITEMS_PER_PAGE);
                if (currentPage > newTotalPages) {
                    setCurrentPage(Math.max(1, newTotalPages));
                }
            }
        } catch (error) {
            console.error('Error deleting bookmark:', error);
            alert('북마크 삭제에 실패했습니다.');
        }
    };

    const totalPages = Math.ceil(bookmarks.length / ITEMS_PER_PAGE);
    const currentBookmarks = bookmarks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
            <TitleContainer>
                <SmallText>북마크</SmallText>
                <StrongText>즐겨찾기한 말씀</StrongText>
            </TitleContainer>

            <ResultsContainer>
                {loading ? (
                    <LoadingText>북마크를 불러오는 중...</LoadingText>
                ) : currentBookmarks.length === 0 ? (
                    <EmptyText>저장된 북마크가 없습니다.</EmptyText>
                ) : (
                    currentBookmarks.map((bookmark) => (
                        <ResultItem key={bookmark.idx}>
                            <ResultContent>
                                <ResultHeader>
                                    {bookmark.long_label} {bookmark.chapter}장 {bookmark.paragraph}절
                                </ResultHeader>
                                <VerseText>{bookmark.sentence}</VerseText>
                            </ResultContent>
                            <DeleteButton onClick={() => handleDeleteBookmark(bookmark)} aria-label="북마크 삭제">
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
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* 왼쪽 정렬로 변경 */
    padding-left: 20px; /* 여백 조정 */
    background-color: #f5f5f5;
    overflow-y: hidden;
`;

const TitleContainer = styled.div`
    width: 100%;
    max-width: 800px;
    margin-top: 50px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const SmallText = styled.div`
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-size: 48px;
    line-height: 140%;
    color: #757575;
`;

const StrongText = styled.div`
    font-family: 'Inter';
    font-style: normal;
    font-weight: 600;
    font-size: 50px;
    line-height: 140%;
    color: #1e1e1e;
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

const ResultItem = styled.div`
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
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

const EmptyText = styled(LoadingText)`
    color: #999;
`;

export default BookmarkPage;

import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import SermonDetailPage from '../sermon/SermonDetailPage';
import styled from 'styled-components';
import { getBookmarks, deleteBookmark, deleteSermon } from '../../services/APIService';
import { useUserState } from '../../recoil/utils';

const BookmarkSermonDetailPage = () => {
    const { id } = useParams();
    const { userId } = useUserState();
    const navigate = useNavigate();

    const handleDelete = async () => {
        if (window.confirm('정말로 이 설교를 삭제하시겠습니까?')) {
            try {
                // 북마크 상태 확인
                const bookmarksResponse = await getBookmarks(userId);
                const bookmarkedSermon = bookmarksResponse.sermons.find((b) => b.sermonId === parseInt(id));

                // 북마크가 있다면 삭제
                if (bookmarkedSermon) {
                    await deleteBookmark(userId, bookmarkedSermon.bookmarkId);
                }

                // 설교 삭제
                const response = await deleteSermon(id, userId);
                if (response.success) {
                    alert('설교가 삭제되었습니다.');
                    navigate('/main/mypage');
                } else {
                    alert('설교 삭제에 실패했습니다.');
                }
            } catch (error) {
                console.error('Error deleting sermon:', error);
                alert('설교 삭제 중 오류가 발생했습니다.');
            }
        }
    };

    const handleBookmarkToggle = async () => {
        try {
            // 북마크 상태 확인
            const bookmarksResponse = await getBookmarks(userId);
            const bookmarkedSermon = bookmarksResponse.sermons.find((b) => b.sermonId === parseInt(id));

            if (bookmarkedSermon) {
                const deleteResponse = await deleteBookmark(userId, bookmarkedSermon.bookmarkId);
                if (deleteResponse.success) {
                    alert('북마크가 삭제되었습니다.');
                    navigate('/main/mypage'); // 마이페이지로 이동
                }
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            alert('북마크 처리 중 오류가 발생했습니다.');
        }
    };

    return (
        <Container>
            <SermonDetailPage isBookmarkView={true} onDelete={handleDelete} onBookmarkToggle={handleBookmarkToggle} />
        </Container>
    );
};

export default BookmarkSermonDetailPage;

const Container = styled.div`
    width: 100%;
    height: 100%;
`;

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Edit2, Trash2, ChevronLeft, ChevronRight, ArrowLeft, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserState } from '../../recoil/utils';

const SermonManagementPage = () => {
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [searchType, setSearchType] = useState('title');
    const navigate = useNavigate();
    const { userId } = useUserState();
    const itemsPerPage = 10;
    const [originalUserId, setOriginalUserId] = useState(null);

    const loadSermons = async () => {
        setLoading(true);
        try {
            // 새로운 API 호출 로직이 여기에 들어갈 예정
        } catch (error) {
            console.error('Failed to load sermons:', error);
            setSermons([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadSermons();
    }, []);

    const handleSearch = async () => {
        if (!searchValue.trim()) {
            loadSermons();
            return;
        }
        setLoading(true);
        try {
            // 새로운 API 호출 로직이 여기에 들어갈 예정
            setCurrentPage(1);
        } catch (error) {
            console.error('Search failed:', error);
            setSermons([]);
        }
        setLoading(false);
    };

    const handleEdit = (sermonId) => {
        const sermon = sermons.find((s) => s.sermonId === sermonId);
        setOriginalUserId(sermon.userId);
        navigate(`/main/admin/sermons/edit/${sermonId}`);
    };

    const handleDelete = async (sermonId) => {
        if (window.confirm('정말로 이 설교를 삭제하시겠습니까?')) {
            try {
                // 새로운 API 호출 로직이 여기에 들어갈 예정
                loadSermons();
            } catch (error) {
                console.error('Failed to delete sermon:', error);
            }
        }
    };

    const handleViewDetail = (sermonId) => {
        navigate(`/main/sermon-list/detail/${sermonId}`);
    };

    const totalPages = Math.ceil(sermons.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSermons = sermons.slice(startIndex, endIndex);

    return (
        <Container>
            <ContentWrapper>
                <TopBar>
                    <BackButton onClick={() => navigate('/main/admin')}>
                        <ArrowLeft size={20} />
                        <span>뒤로 가기</span>
                    </BackButton>
                </TopBar>

                <Header>
                    <SearchContainer>
                        <Select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                            <option value="title">제목</option>
                            <option value="content">내용</option>
                            <option value="both">제목+내용</option>
                        </Select>
                        <SearchInput
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="검색어를 입력하세요"
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <SearchButton onClick={handleSearch}>
                            <Search size={20} />
                        </SearchButton>
                    </SearchContainer>
                </Header>

                {loading ? (
                    <LoadingText>로딩 중...</LoadingText>
                ) : sermons.length === 0 ? (
                    <EmptyState>설교 데이터가 없습니다.</EmptyState>
                ) : (
                    <>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>작성자</Th>
                                    <Th>제목</Th>
                                    <Th>예배 종류</Th>
                                    <Th>성경 구절</Th>
                                    <Th>작성일</Th>
                                    <Th>공개 여부</Th>
                                    <Th>작업</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentSermons.map((sermon) => (
                                    <tr key={sermon.sermonId}>
                                        <Td>{sermon.ownerName}</Td>
                                        <Td>{sermon.sermonTitle}</Td>
                                        <Td>{sermon.worshipType}</Td>
                                        <Td>{sermon.mainScripture}</Td>
                                        <Td>{new Date(sermon.createdAt).toLocaleDateString()}</Td>
                                        <Td>
                                            <PublicBadge isPublic={sermon.public}>
                                                {sermon.public ? '공개' : '비공개'}
                                            </PublicBadge>
                                        </Td>
                                        <Td>
                                            <ActionButton onClick={() => handleViewDetail(sermon.sermonId)}>
                                                <Eye size={16} color="#4f3296" />
                                            </ActionButton>
                                            <ActionButton onClick={() => handleEdit(sermon.sermonId)}>
                                                <Edit2 size={16} color="#4f3296" />
                                            </ActionButton>
                                            <ActionButton onClick={() => handleDelete(sermon.sermonId)}>
                                                <Trash2 size={16} color="red" />
                                            </ActionButton>
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        <Pagination>
                            <PaginationButton
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={20} />
                            </PaginationButton>
                            <PageInfo>
                                {currentPage} / {totalPages}
                            </PageInfo>
                            <PaginationButton
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight size={20} />
                            </PaginationButton>
                        </Pagination>
                    </>
                )}
            </ContentWrapper>
        </Container>
    );
};

const Container = styled.div`
    padding: 40px;
    margin: 0 auto;
    min-height: 92vh;
    background-color: white;
`;

const ContentWrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    padding: 48px;
`;

const TopBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
`;

const BackButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: transparent;
    border: none;
    color: #4f3296;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 8px;

    &:hover {
        background: #f3f4f6;
    }

    svg {
        transition: transform 0.2s ease;
    }

    &:hover svg {
        transform: translateX(-4px);
    }
`;

const Header = styled.div`
    margin-bottom: 30px;
`;

const SearchContainer = styled.div`
    display: flex;
    gap: 10px;
`;

const SearchInput = styled.input`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    width: 250px;
    font-size: 14px;
`;

const Select = styled.select`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background-color: white;
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

const Table = styled.table`
    width: 100%;
    background-color: white;
    border-radius: 8px;
    border-collapse: collapse;
`;

const Th = styled.th`
    padding: 15px;
    text-align: left;
    border-bottom: 2px solid #eee;
    color: #666;
    font-weight: 600;
`;

const Td = styled.td`
    padding: 15px;
    border-bottom: 1px solid #eee;
`;

const ActionButton = styled.button`
    padding: 6px;
    background: none;
    border: none;
    cursor: pointer;
    margin: 0 4px;

    &:hover {
        background-color: #f5f5f5;
        border-radius: 4px;
    }
`;

const Pagination = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    gap: 10px;
`;

const PaginationButton = styled.button`
    padding: 8px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
    }

    &:hover:not(:disabled) {
        background-color: #f5f5f5;
    }
`;

const PageInfo = styled.span`
    font-size: 14px;
    color: #666;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 40px;
    background-color: white;
    border-radius: 8px;
    color: #666;
    font-size: 1.1rem;
`;

const LoadingText = styled.div`
    text-align: center;
    padding: 40px;
    color: #666;
    font-size: 1.1rem;
`;

const PublicBadge = styled.span`
    padding: 4px 8px;
    background: ${(props) => (props.isPublic ? '#4F3296' : '#666')};
    color: white;
    border-radius: 12px;
    font-size: 12px;
`;

export default SermonManagementPage;

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Edit2, Trash2, X, Check, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { getAdminUsers, searchAdminUsers, updateAdminUser, deleteAdminUser } from '../../services/APIService';
import { useNavigate } from 'react-router-dom';

const UserManagementPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [searchType, setSearchType] = useState('name');
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [editingUser, setEditingUser] = useState(null);
    const itemsPerPage = 10;

    const loadUsers = async () => {
        try {
            const data = await getAdminUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleSearch = async () => {
        if (!searchValue.trim()) {
            loadUsers();
            return;
        }
        try {
            const results = await searchAdminUsers(searchType, searchValue);
            setUsers(Array.isArray(results) ? results : []);
            setCurrentPage(1);
        } catch (error) {
            console.error('Search failed:', error);
            setUsers([]);
        }
    };

    const handleEdit = (user) => {
        setEditingUser({ ...user });
    };

    const handleSave = async () => {
        try {
            await updateAdminUser(editingUser.id, editingUser);
            setEditingUser(null);
            loadUsers();
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
            try {
                await deleteAdminUser(userId);
                loadUsers();
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
    };

    const totalPages = Math.ceil(users.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = users.slice(startIndex, endIndex);

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
                    <Title>사용자 관리</Title>
                    <SearchContainer>
                        <Select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                            <option value="name">이름</option>
                            <option value="email">이메일</option>
                            <option value="job">직분</option>
                            <option value="church">교회</option>
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

                {users.length === 0 ? (
                    <EmptyState>검색 결과가 없습니다.</EmptyState>
                ) : (
                    <>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>이름</Th>
                                    <Th>이메일</Th>
                                    <Th>연락처</Th>
                                    <Th>교회</Th>
                                    <Th>직분</Th>
                                    <Th>지역</Th>
                                    <Th>가입일</Th>
                                    <Th>작업</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.map((user) => (
                                    <tr key={user.id}>
                                        {editingUser?.id === user.id ? (
                                            <>
                                                <Td>
                                                    <Input
                                                        value={editingUser.name}
                                                        onChange={(e) =>
                                                            setEditingUser({ ...editingUser, name: e.target.value })
                                                        }
                                                    />
                                                </Td>
                                                <Td>
                                                    <Input
                                                        value={editingUser.email}
                                                        onChange={(e) =>
                                                            setEditingUser({ ...editingUser, email: e.target.value })
                                                        }
                                                    />
                                                </Td>
                                                <Td>
                                                    <Input
                                                        value={editingUser.contact}
                                                        onChange={(e) =>
                                                            setEditingUser({ ...editingUser, contact: e.target.value })
                                                        }
                                                    />
                                                </Td>
                                                <Td>
                                                    <Input
                                                        value={editingUser.church}
                                                        onChange={(e) =>
                                                            setEditingUser({ ...editingUser, church: e.target.value })
                                                        }
                                                    />
                                                </Td>
                                                <Td>
                                                    <Select
                                                        value={editingUser.job}
                                                        onChange={(e) =>
                                                            setEditingUser({ ...editingUser, job: e.target.value })
                                                        }
                                                    >
                                                        <option value="목회자">목회자</option>
                                                        <option value="평신도">평신도</option>
                                                    </Select>
                                                </Td>
                                                <Td>
                                                    <Input
                                                        value={editingUser.place}
                                                        onChange={(e) =>
                                                            setEditingUser({ ...editingUser, place: e.target.value })
                                                        }
                                                    />
                                                </Td>
                                                <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                                                <Td>
                                                    <ActionButton onClick={handleSave}>
                                                        <Check size={16} color="green" />
                                                    </ActionButton>
                                                    <ActionButton onClick={() => setEditingUser(null)}>
                                                        <X size={16} color="red" />
                                                    </ActionButton>
                                                </Td>
                                            </>
                                        ) : (
                                            <>
                                                <Td>{user.name}</Td>
                                                <Td>{user.email}</Td>
                                                <Td>{user.contact}</Td>
                                                <Td>{user.church}</Td>
                                                <Td>{user.job}</Td>
                                                <Td>{user.place}</Td>
                                                <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                                                <Td>
                                                    <ActionButton onClick={() => handleEdit(user)}>
                                                        <Edit2 size={16} color="#4f3296" />
                                                    </ActionButton>
                                                    <ActionButton onClick={() => handleDelete(user.id)}>
                                                        <Trash2 size={16} color="red" />
                                                    </ActionButton>
                                                </Td>
                                            </>
                                        )}
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
    width: 80vw;
    min-height: 92vh;
    background-color: white;
`;

const ContentWrapper = styled.div`
    margin: 0 auto;
    max-width: 1200px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    color: #333;
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

const Input = styled.input`
    width: 100%;
    padding: 6px;
    border: 1px solid #ddd;
    border-radius: 4px;
`;

const Select = styled.select`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background-color: white;
    font-size: 14px;
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    color: #666;
    font-size: 1.1rem;
`;

export default UserManagementPage;

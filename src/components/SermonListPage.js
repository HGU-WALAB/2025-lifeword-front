import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getSermons, getSermonById } from '../services/APIService';
import { X, Calendar, User, Tag } from 'lucide-react';

const SermonListPage = () => {
    const [sermons, setSermons] = useState([]);
    const [selectedSermon, setSelectedSermon] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSermons();
    }, []);

    const fetchSermons = async () => {
        try {
            const response = await getSermons();
            if (response.success) {
                setSermons(response.response_object);
            }
        } catch (error) {
            console.error('Error fetching sermons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSermonClick = async (id) => {
        try {
            const response = await getSermonById(id);
            if (response.success) {
                setSelectedSermon(response.response_object);
            }
        } catch (error) {
            console.error('Error fetching sermon details:', error);
        }
    };

    return (
        <Container>
            <PageHeader>
                <Title>설교 목록</Title>
                <Description>등록된 설교 목록을 확인하고 내용을 살펴보세요.</Description>
            </PageHeader>

            <ContentWrapper>
                <SermonGrid>
                    {loading ? (
                        <LoadingText>로딩 중...</LoadingText>
                    ) : sermons.length > 0 ? (
                        sermons.map((sermon) => (
                            <SermonCard key={sermon.id} onClick={() => handleSermonClick(sermon.id)}>
                                <SermonTitle>{sermon.title}</SermonTitle>
                                <SermonMeta>
                                    <MetaItem>
                                        <Calendar size={16} />
                                        {sermon.sermonDate}
                                    </MetaItem>
                                    <MetaItem>
                                        <User size={16} />
                                        {sermon.owner}
                                    </MetaItem>
                                </SermonMeta>
                            </SermonCard>
                        ))
                    ) : (
                        <EmptyText>등록된 설교가 없습니다.</EmptyText>
                    )}
                </SermonGrid>
            </ContentWrapper>

            {selectedSermon && (
                <ModalOverlay onClick={() => setSelectedSermon(null)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>{selectedSermon.title}</ModalTitle>
                            <CloseButton onClick={() => setSelectedSermon(null)}>
                                <X size={24} />
                            </CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <SermonInfo>
                                <InfoItem>
                                    <InfoLabel>
                                        <User size={16} />
                                        작성자
                                    </InfoLabel>
                                    {selectedSermon.owner}
                                </InfoItem>
                                <InfoItem>
                                    <InfoLabel>
                                        <Calendar size={16} />
                                        설교 날짜
                                    </InfoLabel>
                                    {selectedSermon.sermonDate}
                                </InfoItem>
                                <InfoItem>
                                    <InfoLabel>
                                        <Tag size={16} />
                                        키워드
                                    </InfoLabel>
                                    {selectedSermon.keywords.join(', ')}
                                </InfoItem>
                            </SermonInfo>
                            <SermonContent>{selectedSermon.sermonContent}</SermonContent>
                        </ModalBody>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Container>
    );
};

const Container = styled.div`
    margin-left: 320px;
    padding: 40px;
    width: calc(100vw - 400px);
    min-height: 91vh;
    background-color: #f5f5f5;
`;

const PageHeader = styled.div`
    margin-bottom: 40px;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    color: #333;
    margin-bottom: 0.5rem;
    font-weight: 600;
`;

const Description = styled.p`
    color: #666;
    font-size: 1.1rem;
`;

const ContentWrapper = styled.div`
    background: white;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SermonGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
`;

const SermonCard = styled.div`
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid #eee;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        border-color: #4f3296;
    }
`;

const SermonTitle = styled.h3`
    font-size: 1.3rem;
    color: #4f3296;
    margin-bottom: 16px;
    font-weight: 600;
`;

const SermonMeta = styled.div`
    display: flex;
    gap: 16px;
`;

const MetaItem = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    color: #666;
    font-size: 0.9rem;

    svg {
        color: #4f3296;
    }
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
    background: white;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    border-radius: 16px;
    padding: 32px;
    overflow-y: auto;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #eee;
`;

const ModalTitle = styled.h2`
    color: #4f3296;
    margin: 0;
    font-size: 1.8rem;
    font-weight: 600;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background-color: #f5f5f5;
        color: #4f3296;
    }
`;

const ModalBody = styled.div`
    padding: 16px 0;
`;

const SermonInfo = styled.div`
    background: #f8f8f8;
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 32px;
`;

const InfoItem = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 1.1rem;
    color: #333;

    &:last-child {
        margin-bottom: 0;
    }
`;

const InfoLabel = styled.span`
    display: flex;
    align-items: center;
    gap: 8px;
    width: 120px;
    color: #666;
    font-weight: 500;

    svg {
        color: #4f3296;
    }
`;

const SermonContent = styled.div`
    line-height: 1.8;
    white-space: pre-wrap;
    color: #333;
    font-size: 1.1rem;
`;

const LoadingText = styled.div`
    text-align: center;
    padding: 40px;
    color: #666;
    grid-column: 1 / -1;
    font-size: 1.1rem;
`;

const EmptyText = styled(LoadingText)`
    color: #999;
`;

export default SermonListPage;

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getBooks, getBibles } from '../services/APIService';
import VerseContextMenu from './VerseContextMenu';

const QuickReadingPage = () => {
    const [testament, setTestament] = useState('구');
    const [books, setBooks] = useState([]);
    const [currentBook, setCurrentBook] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [currentChapter, setCurrentChapter] = useState(1);
    const [verses, setVerses] = useState([]);
    const [loading, setLoading] = useState(false);

    const activeChapterRef = useRef(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await getBooks(testament);
                if (response.success && response.response_object.length > 0) {
                    const uniqueBooks = response.response_object.filter(
                        (book, index, self) =>
                            index === self.findIndex((b) => b.book === book.book && b.long_label === book.long_label)
                    );
                    setBooks(uniqueBooks);
                    setCurrentBook(uniqueBooks[0]);
                }
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };
        setBooks([]);
        fetchBooks();
    }, [testament]);

    useEffect(() => {
        const fetchVerses = async () => {
            if (!currentBook) return;

            setLoading(true);
            try {
                const response = await getBibles(testament, currentBook.book);
                if (response.success) {
                    const uniqueChapters = [...new Set(response.response_object.map((verse) => verse.chapter))];
                    setChapters(uniqueChapters);

                    const currentChapterVerses = response.response_object.filter(
                        (verse) => verse.chapter === currentChapter
                    );
                    setVerses(currentChapterVerses);
                }
            } catch (error) {
                console.error('Error fetching verses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVerses();
    }, [testament, currentBook, currentChapter]);

    const handlePrevChapter = () => {
        if (currentChapter > Math.min(...chapters)) {
            setCurrentChapter((prev) => prev - 1);
        }
    };

    const handleNextChapter = () => {
        if (currentChapter < Math.max(...chapters)) {
            setCurrentChapter((prev) => prev + 1);
        }
    };

    useEffect(() => {
        if (activeChapterRef.current) {
            activeChapterRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
        }
    }, [currentChapter]);

    return (
        <Container>
            <TestamentSelector>
                <TestamentButton active={testament === '구'} onClick={() => setTestament('구')}>
                    구약
                </TestamentButton>
                <TestamentButton active={testament === '신'} onClick={() => setTestament('신')}>
                    신약
                </TestamentButton>
                <Indicator testament={testament} />
            </TestamentSelector>

            <BookNavigation>
                {books.map((book) => (
                    <BookButton
                        key={book.book}
                        active={currentBook?.book === book.book}
                        onClick={() => {
                            setCurrentBook(book);
                            setCurrentChapter(1);
                        }}
                    >
                        {book.long_label}
                    </BookButton>
                ))}
            </BookNavigation>

            <NavigationContainer>
                <NavigationButton
                    onClick={handlePrevChapter}
                    disabled={!chapters.length || currentChapter <= Math.min(...chapters)}
                >
                    <ChevronLeft size={20} />
                </NavigationButton>
                <ChapterNavigation>
                    {chapters.map((chapter) => (
                        <ChapterButton
                            key={chapter}
                            ref={currentChapter === chapter ? activeChapterRef : null}
                            active={currentChapter === chapter}
                            onClick={() => setCurrentChapter(chapter)}
                        >
                            {chapter}장
                        </ChapterButton>
                    ))}
                </ChapterNavigation>
                <NavigationButton
                    onClick={handleNextChapter}
                    disabled={!chapters.length || currentChapter >= Math.max(...chapters)}
                >
                    <ChevronRight size={20} />
                </NavigationButton>
            </NavigationContainer>

            <ScrollView>
                {loading ? (
                    <LoadingText>성경 구절을 불러오는 중...</LoadingText>
                ) : (
                    <ChapterSection>
                        <ChapterTitle>
                            {currentBook?.long_label} {currentChapter}장
                        </ChapterTitle>
                        {verses.map((verse) => (
                            <VerseItem key={verse.idx} verse={verse} />
                        ))}
                    </ChapterSection>
                )}
            </ScrollView>
        </Container>
    );
};

const VerseItem = ({ verse }) => {
    const verseRef = useRef(null);

    return (
        <VerseItemContainer ref={verseRef}>
            <VerseNumber>{verse.paragraph}</VerseNumber>
            <VerseSentence>{verse.sentence}</VerseSentence>
            <VerseContextMenu targetRef={verseRef} verse={verse} />
        </VerseItemContainer>
    );
};

const Container = styled.div`
    padding: 40px;
    margin-left: 280px;
    width: calc(100vw - 280px);
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f5f5f5;
    height: 92vh;
`;

const TestamentSelector = styled.div`
    position: relative;
    display: flex;
    gap: 40px;
    margin-bottom: 40px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e0e0e0;
    width: 300px;
`;

const TestamentButton = styled.button`
    flex: 1;
    padding: 10px;
    border: none;
    background: none;
    font-size: 18px;
    color: ${(props) => (props.active ? '#4F3296' : '#666666')};
    cursor: pointer;
    transition: color 0.3s ease;
    font-weight: ${(props) => (props.active ? '600' : '400')};
`;

const Indicator = styled.div`
    position: absolute;
    bottom: -1px;
    left: ${(props) => (props.testament === '구' ? '0' : '50%')};
    width: 50%;
    height: 2px;
    background-color: #4f3296;
    transition: left 0.3s ease;
`;

const BookNavigation = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    width: 100%;
    max-width: 800px;
    margin-bottom: 20px;
    padding: 16px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ScrollView = styled.div`
    width: 100%;
    max-width: 800px;
    height: calc(100vh - 450px);
    overflow-y: auto;
    margin: 20px 0;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NavigationContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    max-width: 800px;
    background-color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ChapterNavigation = styled.div`
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
    flex: 1;
    overflow-x: auto;
    padding: 8px;
    -ms-overflow-style: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const NavigationButton = styled.button`
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

const BookButton = styled.button`
    padding: 8px 16px;
    border: none;
    border-radius: 20px;
    background-color: ${(props) => (props.active ? '#4F3296' : '#f5f5f5')};
    color: ${(props) => (props.active ? 'white' : '#333')};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    font-weight: ${(props) => (props.active ? '600' : '400')};

    &:hover {
        background-color: ${(props) => (props.active ? '#3a2570' : '#e5e5e5')};
    }
`;

const ChapterButton = styled(BookButton)`
    min-width: 60px;
    text-align: center;
`;

const ChapterSection = styled.div`
    margin-bottom: 40px;
`;

const ChapterTitle = styled.h2`
    color: #4f3296;
    font-size: 24px;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #4f3296;
`;

const VerseItemContainer = styled.div`
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    cursor: pointer;
`;

const VerseNumber = styled.span`
    min-width: 24px;
    color: #4f3296;
    font-weight: bold;
`;

const VerseSentence = styled.p`
    margin: 0;
    line-height: 1.6;
`;

const LoadingText = styled.div`
    text-align: center;
    padding: 20px;
    color: #666666;
`;

export default QuickReadingPage;

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getBooks, getBibles } from '../services/APIService';

const BibleReadingPage = () => {
    const activeBookRef = React.useRef(null);
    const [testament, setTestament] = useState('구');
    const [books, setBooks] = useState([]);
    const [currentBook, setCurrentBook] = useState(null);
    const [verses, setVerses] = useState({});
    const [loading, setLoading] = useState(false);

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
        if (activeBookRef.current) {
            activeBookRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
        }
    }, [currentBook?.book]);

    useEffect(() => {
        const fetchVerses = async () => {
            if (!currentBook) return;

            setLoading(true);
            try {
                const response = await getBibles(testament, currentBook.book);
                if (response.success) {
                    const versesByChapter = response.response_object.reduce((acc, verse) => {
                        const chapter = verse.chapter;
                        if (!acc[chapter]) {
                            acc[chapter] = [];
                        }
                        acc[chapter].push(verse);
                        return acc;
                    }, {});
                    setVerses(versesByChapter);
                }
            } catch (error) {
                console.error('Error fetching verses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVerses();
    }, [testament, currentBook]);

    const handlePrevBook = () => {
        const currentIndex = books.findIndex((book) => book.book === currentBook?.book);
        if (currentIndex > 0) {
            setCurrentBook(books[currentIndex - 1]);
        }
    };

    const handleNextBook = () => {
        const currentIndex = books.findIndex((book) => book.book === currentBook?.book);
        if (currentIndex < books.length - 1) {
            setCurrentBook(books[currentIndex + 1]);
        }
    };

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

            <ScrollView>
                {loading ? (
                    <LoadingText>성경 구절을 불러오는 중...</LoadingText>
                ) : (
                    Object.entries(verses).map(([chapter, chapterVerses]) => (
                        <ChapterSection key={chapter}>
                            <ChapterTitle>
                                {currentBook?.long_label} {chapter}장
                            </ChapterTitle>
                            {chapterVerses.map((verse) => (
                                <VerseItem key={verse.idx}>
                                    <VerseNumber>{verse.paragraph}</VerseNumber>
                                    <VerseSentence>{verse.sentence}</VerseSentence>
                                </VerseItem>
                            ))}
                        </ChapterSection>
                    ))
                )}
            </ScrollView>

            <NavigationContainer>
                <NavigationButton
                    onClick={handlePrevBook}
                    disabled={!currentBook || books.findIndex((book) => book.book === currentBook?.book) === 0}
                >
                    <ChevronLeft size={20} />
                </NavigationButton>
                <BookNavigation>
                    {books.map((book) => (
                        <BookButton
                            key={book.book}
                            ref={currentBook?.book === book.book ? activeBookRef : null}
                            active={currentBook?.book === book.book}
                            onClick={() => setCurrentBook(book)}
                        >
                            {book.long_label}
                        </BookButton>
                    ))}
                </BookNavigation>
                <NavigationButton
                    onClick={handleNextBook}
                    disabled={
                        !currentBook || books.findIndex((book) => book.book === currentBook?.book) === books.length - 1
                    }
                >
                    <ChevronRight size={20} />
                </NavigationButton>
            </NavigationContainer>
        </Container>
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
`;

const TestamentSelector = styled.div`
    position: relative;
    display: flex;
    gap: 40px;
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

const ScrollView = styled.div`
    width: 100%;
    max-width: 800px;
    height: calc(100vh - 300px);
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

const BookNavigation = styled.div`
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
    white-space: nowrap;

    &:hover {
        background-color: ${(props) => (props.active ? '#3a2570' : '#e5e5e5')};
    }
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

const VerseItem = styled.div`
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
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

export default BibleReadingPage;

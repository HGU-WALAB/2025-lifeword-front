import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { ChevronDown } from 'lucide-react';

const SermonHeader = ({ sermon, onHeightChange }) => {
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
    const headerRef = useRef(null);

    useEffect(() => {
        if (headerRef.current && onHeightChange) {
            const observer = new ResizeObserver((entries) => {
                onHeightChange(entries[0].target.offsetHeight);
            });

            observer.observe(headerRef.current);
            return () => observer.disconnect();
        }
    }, [onHeightChange]);

    const toggleHeader = () => {
        setIsHeaderExpanded((prev) => !prev);
    };

    return (
        <HeaderContainer ref={headerRef}>
            {isHeaderExpanded ? (
                <>
                    <HeaderContent>
                        <MetaInfo>
                            <FormSectionLong>
                                <Author>{sermon.ownerName}</Author>
                                <DateInfo>
                                    <SermonDate>
                                        {new Date(sermon.sermonDate).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </SermonDate>
                                    <WorshipTag>{sermon.worshipType}</WorshipTag>
                                </DateInfo>
                            </FormSectionLong>
                            <FormSection>
                                <Label>설교 제목</Label>
                                <Title>{sermon.sermonTitle}</Title>
                            </FormSection>
                        </MetaInfo>
                        <ScriptureInfo>
                            <FormSection>
                                <Label>성경 본문</Label>
                                <ScriptureContainer>
                                    <Scripture>{sermon.mainScripture}</Scripture>
                                    {sermon.additionalScripture && <Scripture>{sermon.additionalScripture}</Scripture>}
                                </ScriptureContainer>
                            </FormSection>
                        </ScriptureInfo>
                        <ExtraInfo>
                            <SectionContainer>
                                <SectionLabel>요약</SectionLabel>
                                <SectionBox>{sermon.summary}</SectionBox>
                            </SectionContainer>
                        </ExtraInfo>
                    </HeaderContent>
                    <ToggleButton onClick={toggleHeader} isExpanded={isHeaderExpanded}>
                        <ChevronDown />
                    </ToggleButton>
                </>
            ) : (
                <CompactHeader onClick={toggleHeader}>
                    <CompactHeaderWrapper>
                        <div>
                            <CompactMeta>
                                <CompactDate>
                                    {new Date(sermon.sermonDate).toLocaleDateString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </CompactDate>
                                <CompactDate>{sermon.worshipType}</CompactDate>
                            </CompactMeta>
                            <CompactTitle>{sermon.sermonTitle}</CompactTitle>
                            <CompactScripture>
                                <span>{sermon.mainScripture}</span>
                                {sermon.additionalScripture && <span>{sermon.additionalScripture}</span>}
                            </CompactScripture>
                        </div>
                    </CompactHeaderWrapper>
                </CompactHeader>
            )}
        </HeaderContainer>
    );
};

const HeaderContainer = styled.div`
    background: white;
    width: 100%;
    border-bottom: none;
    transition: all 0.3s ease;
    margin-bottom: 0;
    position: sticky;
    top: 0;
    z-index: 200;
    box-shadow: 0 1px 0 0 #e9ecef;
`;

const HeaderContent = styled.div`
    padding: 32px 40px;
    max-width: 1200px;
    margin: 0 auto;
    animation: slideDown 0.3s ease;

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const CompactHeader = styled.div`
    cursor: pointer;
    transition: all 0.2s ease;
    animation: slideUp 0.3s ease;

    &:hover {
        background: #f8f9fa;
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const CompactHeaderWrapper = styled.div`
    padding: 20px 40px;
    max-width: 1200px;
    margin: 0 auto;
`;

const CompactMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
`;

const CompactDate = styled.span`
    font-size: 14px;
    color: #595c62;

    &:not(:first-child)::before {
        content: '•';
        margin: 0 8px;
        color: #dee2e6;
    }
`;

const CompactTitle = styled.h1`
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
`;

const CompactScripture = styled.div`
    font-size: 14px;
    color: #4f3296;
    display: flex;
    gap: 16px;

    span {
        font-weight: 500;
    }
`;

const MetaInfo = styled.div`
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const FormSectionLong = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Author = styled.span`
    font-size: 16px;
    color: #4f3296;
    font-weight: 600;
`;

const DateInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const SermonDate = styled.span`
    font-size: 14px;
    color: #595c62;
    font-weight: 500;
`;

const WorshipTag = styled.span`
    font-size: 12px;
    padding: 4px 12px;
    background: #eee6ff;
    border: 1px solid #d4c4ff;
    border-radius: 4px;
    color: #482895;
`;

const FormSection = styled.div`
    margin-top: 8px;
`;

const Label = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #4f3296;
    margin-bottom: 4px;
`;

const Title = styled.h1`
    font-size: 1.75rem;
    color: #333;
    font-weight: 600;
    margin: 0;
`;

const ScriptureInfo = styled.div`
    margin-bottom: 24px;
`;

const ScriptureContainer = styled.div`
    display: flex;
    gap: 16px;
    font-size: 16px;
    color: #212a3e;
`;

const Scripture = styled.span`
    font-weight: 500;
`;

const ExtraInfo = styled.div`
    margin-bottom: 24px;
`;

const SectionContainer = styled.div`
    width: 100%;
`;

const SectionLabel = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #4f3296;
    margin-bottom: 4px;
`;

const SectionBox = styled.div`
    background: #f8f9fa;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 14px;
    color: #333;
    line-height: 1.5;
`;

const ToggleButton = styled.button`
    width: 100%;
    padding: 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #868e96;
    transition: all 0.3s ease;

    &:hover {
        background: #f8f9fa;
    }

    svg {
        transform: ${(props) => (props.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)')};
        transition: transform 0.3s ease;
    }
`;

export default SermonHeader;

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Bookmark, Copy, Share } from 'lucide-react';
import { createBookmark } from '../../services/APIService';
import { useUserState } from '../../recoil/utils';

const VerseContextMenu = ({ targetRef, verse }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const { userId } = useUserState();

    const handleContextMenu = useCallback((e) => {
        e.preventDefault();
        setIsVisible(true);
        setPosition({
            x: e.clientX + 10,
            y: e.clientY + 10,
        });
    }, []);

    const handleClickOutside = useCallback(
        (e) => {
            if (isVisible && !e.target.closest('.context-menu')) {
                setIsVisible(false);
            }
        },
        [isVisible]
    );

    const handleBookmark = async () => {
        try {
            if (!userId) {
                alert('로그인이 필요합니다.');
                return;
            }

            const response = await createBookmark(userId, verse.idx,null,false);
            if (response.success) {
                alert('북마크가 추가되었습니다.');
            } else if (response.message === 'Already bookmarked') {
                alert('이미 북마크된 구절입니다.');
            } else {
                alert(response.message || '북마크 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error creating bookmark:', error);
            alert('북마크 추가에 실패했습니다.');
        }
        setIsVisible(false);
    };

    useEffect(() => {
        const element = targetRef.current;
        if (element) {
            element.addEventListener('contextmenu', handleContextMenu);
            document.addEventListener('click', handleClickOutside);

            return () => {
                element.removeEventListener('contextmenu', handleContextMenu);
                document.removeEventListener('click', handleClickOutside);
            };
        }
    }, [targetRef, handleContextMenu, handleClickOutside]);

    if (!isVisible) return null;

    return (
        <MenuContainer className="context-menu" style={{ top: position.y, left: position.x }}>
            <MenuItem onClick={handleBookmark}>
                <Bookmark size={16} />
                북마크 추가
            </MenuItem>
        </MenuContainer>
    );
};

const MenuContainer = styled.div`
    position: fixed;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 8px;
    z-index: 1000;
    min-width: 150px;
`;

const MenuItem = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: none;
    background: none;
    width: 100%;
    color: #4f3296;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
    border-radius: 4px;

    &:hover {
        background-color: #f5f5f5;
    }
`;

export default VerseContextMenu;

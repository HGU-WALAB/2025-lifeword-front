import React, { useState } from 'react';
import styled from 'styled-components';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftjsToHtml from 'draftjs-to-html';

const SermonEditor = ({ onChange }) => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    const updateTextDescription = async (state) => {
        setEditorState(state);
        const html = draftjsToHtml(convertToRaw(state.getCurrentContent()));
        onChange(html); // 부모 컴포넌트에 HTML 전달
    };

    return (
        <EditorWrapper>
            <Editor
                editorState={editorState}
                onEditorStateChange={updateTextDescription}
                localization={{ locale: 'ko' }}
                toolbar={{
                    options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'history'],
                    inline: {
                        options: ['bold', 'italic', 'underline', 'strikethrough'],
                    },
                }}
                editorStyle={{
                    height: '400px',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '2px solid #eee',
                }}
                placeholder="설교 내용을 입력하세요..."
            />
        </EditorWrapper>
    );
};

const EditorWrapper = styled.div`
    .rdw-editor-wrapper {
        background: white;
        border-radius: 8px;
    }

    .rdw-editor-toolbar {
        border: none;
        background: #f8f9fa;
        border-radius: 8px 8px 0 0;
        padding: 12px;
        border-bottom: 2px solid #eee;
    }

    .rdw-option-wrapper {
        border: none;
        background: white;
        border-radius: 4px;
        padding: 6px;
        min-width: 30px;
        height: 30px;
        margin: 0 4px;

        &:hover {
            box-shadow: 0 0 0 1px #4f3296;
        }

        &.rdw-option-active {
            box-shadow: 0 0 0 2px #4f3296;
        }
    }
`;

export default SermonEditor;

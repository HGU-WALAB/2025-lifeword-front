import React, { Component } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styled from 'styled-components';

const Font = ReactQuill.Quill.import('formats/font');
const Size = ReactQuill.Quill.import('formats/size');

Font.whitelist = ['noto-sans-kr', 'nanum-gothic', 'nanum-myeongjo', 'nanum-pen-script', 'poor-story', 'jua'];

Size.whitelist = ['8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px', '24px', '36px', '48px', '72px', '96px'];
Size.defaultSize = '16px';

ReactQuill.Quill.register(Font, true);
ReactQuill.Quill.register(Size, true);

class SermonEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editorHtml: props.value || '',
            initialHeight: 0, // 초기 높이 저장
        };
        this.quillRef = null;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value) {
            this.setState({ editorHtml: this.props.value });
        }
    }

    componentDidMount() {
        if (this.quillRef) {
            const editor = this.quillRef.getEditor();
            editor.root.style.fontSize = '14px';
            editor.format('size', '14px');
            editor.blur();
            editor.root.blur();

            // 초기 높이 저장
            this.setState({
                initialHeight: editor.root.clientHeight,
            });

            // 에디터 높이 변화 감지를 위한 ResizeObserver 설정
            this.resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    if (entry.target === editor.root) {
                        // 현재 높이가 초기 높이보다 클 때만 스크롤
                        if (entry.target.clientHeight > this.state.initialHeight) {
                            window.scrollTo({
                                top: document.documentElement.scrollHeight,
                                behavior: 'smooth',
                            });
                        }
                    }
                }
            });

            this.resizeObserver.observe(editor.root);
        }
    }

    componentWillUnmount() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    modules = {
        toolbar: {
            container: [
                ['bold', 'italic', 'underline', 'strike'],
                [{ size: Size.whitelist }],
                [{ font: Font.whitelist }],
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                [{ align: ['', 'center', 'right', 'justify'] }],
                [{ color: [] }, { background: [] }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ indent: '-1' }, { indent: '+1' }],
                ['blockquote'],
            ],
        },
    };

    formats = [
        'font',
        'size',
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'align',
        'color',
        'background',
        'list',
        'bullet',
        'indent',
        'blockquote',
    ];

    handleChange = (content) => {
        this.setState({ editorHtml: content }, () => {
            if (this.quillRef) {
                const editor = this.quillRef.getEditor();
                const length = editor.getLength();
                editor.setSelection(length, 0);
            }
        });

        if (this.props.onChange) {
            this.props.onChange(content);
        }
    };

    clearEditor() {
        if (this.quillRef) {
            const editor = this.quillRef.getEditor();
            editor.setContents([]);
        }
    }

    getEditor() {
        return this.quillRef.getEditor();
    }

    render() {
        return (
            <EditorWrapper>
                <StyledQuill
                    ref={(el) => {
                        this.quillRef = el;
                    }}
                    theme="snow"
                    modules={this.modules}
                    formats={this.formats}
                    onChange={this.handleChange}
                    value={this.state.editorHtml}
                    placeholder="설교 내용을 입력하세요..."
                />
            </EditorWrapper>
        );
    }
}

const EditorWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 60%;

    .ql-editor {
        min-height: 300px;
        font-size: 16px;
        line-height: 1.8;
        padding: 24px;
        overflow: hidden;
    }

    .ql-container {
        border: 2px solid #eee;
        border-top: none;
        height: auto !important;
        overflow: visible;
    }

    .ql-toolbar {
        position: sticky;
        top: 32px;
        background: white;
        z-index: 10;
        border: 2px solid #eee;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
    }

    .ql-editor::-webkit-scrollbar {
        width: 8px;
    }

    .ql-editor::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }

    .ql-editor::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
    }

    .ql-editor::-webkit-scrollbar-thumb:hover {
        background: #555;
    }

    .ql-editor p {
        margin-bottom: 1.5em;
    }

    .ql-editor h1,
    .ql-editor h2,
    .ql-editor h3 {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
    }

    .ql-container {
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
        background: white;
    }

    /* 폰트 스타일 */
    .ql-font-nanumgothic {
        font-family: 'NanumGothic', sans-serif;
    }
    .ql-font-dotum {
        font-family: 'Dotum', sans-serif;
    }
    .ql-font-gulim {
        font-family: 'Gulim', sans-serif;
    }
    .ql-font-batang {
        font-family: 'Batang', serif;
    }

    /* 폰트 이름 한글로 표시 */
    .ql-snow .ql-picker.ql-font .ql-picker-label::before,
    .ql-snow .ql-picker.ql-font .ql-picker-item::before {
        content: '기본 글꼴' !important;
    }

    .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='noto-sans-kr']::before,
    .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='noto-sans-kr']::before {
        content: '노토 산스' !important;
        font-family: 'Noto Sans KR';
    }

    .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='nanum-gothic']::before,
    .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='nanum-gothic']::before {
        content: '나눔 고딕' !important;
        font-family: 'Nanum Gothic';
    }

    .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='nanum-myeongjo']::before,
    .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='nanum-myeongjo']::before {
        content: '나눔 명조' !important;
        font-family: 'Nanum Myeongjo';
    }

    .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='nanum-pen-script']::before,
    .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='nanum-pen-script']::before {
        content: '나눔 펜' !important;
        font-family: 'Nanum Pen Script';
    }

    .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='poor-story']::before,
    .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='poor-story']::before {
        content: '푸어 스토리' !important;
        font-family: 'Poor Story';
    }

    .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='jua']::before,
    .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='jua']::before {
        content: '주아' !important;
        font-family: 'Jua';
    }

    /* 폰트 스타일 적용 */
    .ql-font-noto-sans-kr {
        font-family: 'Noto Sans KR', sans-serif;
    }
    .ql-font-nanum-gothic {
        font-family: 'Nanum Gothic', sans-serif;
    }
    .ql-font-nanum-myeongjo {
        font-family: 'Nanum Myeongjo', serif;
    }
    .ql-font-nanum-pen-script {
        font-family: 'Nanum Pen Script', cursive;
    }
    .ql-font-poor-story {
        font-family: 'Poor Story', cursive;
    }
    .ql-font-jua {
        font-family: 'Jua', sans-serif;
    }

    .ql-size-8px {
        font-size: 8px;
    }

    .ql-size-9px {
        font-size: 9px;
    }

    .ql-size-10px {
        font-size: 10px;
    }

    .ql-size-11px {
        font-size: 11px;
    }

    .ql-size-12px {
        font-size: 12px;
    }

    .ql-size-14px {
        font-size: 14px;
    }

    .ql-size-16px {
        font-size: 16px;
    }

    .ql-size-18px {
        font-size: 18px;
    }

    .ql-size-24px {
        font-size: 24px;
    }

    .ql-size-36px {
        font-size: 36px;
    }

    .ql-size-48px {
        font-size: 48px;
    }

    .ql-size-72px {
        font-size: 72px;
    }

    .ql-size-96px {
        font-size: 96px;
    }

    /* Size 선택기 텍스트 변경 */
    .ql-snow .ql-picker.ql-size .ql-picker-label::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item::before {
        content: '16px' !important;
    }

    .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='8px']::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='8px']::before {
        content: '8px' !important;
    }

    .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='9px']::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='9px']::before {
        content: '9px' !important;
    }

    .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='10px']::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='10px']::before {
        content: '10px' !important;
    }

    .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='11px']::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='11px']::before {
        content: '11px' !important;
    }

    .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='12px']::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='12px']::before {
        content: '12px' !important;
    }

    .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='14px']::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='14px']::before {
        content: '14px' !important;
    }

    .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='16px']::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='16px']::before {
        content: '16px' !important;
    }

    .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='18px']::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='18px']::before {
        content: '18px' !important;
    }

    .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='24px']::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='24px']::before {
        content: '24px' !important;
    }

    .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='36px']::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='36px']::before {
        content: '36px' !important;
    }

    .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='48px']::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='48px']::before {
        content: '48px' !important;
    }

    .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='72px']::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='72px']::before {
        content: '72px' !important;
    }

    .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='96px']::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='96px']::before {
        content: '96px' !important;
    }
`;

const StyledQuill = styled(ReactQuill)`
    height: 100%;
    display: flex;
    flex-direction: column;

    .ql-container {
        flex: 1;
    }
`;

export default React.forwardRef((props, ref) => {
    const editorRef = React.useRef();

    React.useImperativeHandle(ref, () => ({
        clearEditor: () => {
            if (editorRef.current) {
                editorRef.current.clearEditor();
            }
        },
    }));

    return <SermonEditor {...props} ref={editorRef} />;
});

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ChevronDown, Lock, Unlock, X, Plus } from "lucide-react";
import { createSermon } from "../../services/APIService";
import SermonEditor from "../Editor/SermonEditor";
import { useUserState } from "../../recoil/utils";

const WORSHIP_TYPES = [
  "새벽예배",
  "수요예배",
  "금요성령집회",
  "주일1부예배",
  "주일2부예배",
  "주일3부예배",
  "주일청년예배",
  "주일오후예배",
  "특별집회",
  "부흥회",
  "기타",
];

const AddSermonPage = () => {
  const navigate = useNavigate();
  const { userId } = useUserState();
  const [isMetaOpen, setIsMetaOpen] = useState(false);
  const editorRef = useRef(null);

  const [sermonData, setSermonData] = useState({
    sermonTitle: "",
    sermonDate: "",
    worshipType: "",
    mainScripture: "",
    additionalScriptures: [],
    summary: "",
    notes: "",
    contentText: "",
    public: true,
    customWorshipType: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // 예배 종류가 변경될 때
    if (name === "worshipType") {
      setSermonData((prev) => ({
        ...prev,
        worshipType: value,
        // 기타가 아닐 때는 customWorshipType 초기화
        ...(value !== "기타" && { customWorshipType: "" }),
      }));
    }
    // 기타 예배 종류를 직접 입력할 때
    else if (name === "customWorshipType") {
      setSermonData((prev) => ({
        ...prev,
        customWorshipType: value,
        worshipType: "기타",
      }));
    }
    // 다른 필드들의 변경
    else {
      setSermonData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEditorChange = (content) => {
    setSermonData((prev) => ({
      ...prev,
      contentText: content,
    }));
  };

  const handleAddScripture = () => {
    setSermonData((prev) => ({
      ...prev,
      additionalScriptures: [...prev.additionalScriptures, ""],
    }));
  };

  const handleRemoveScripture = (index) => {
    setSermonData((prev) => ({
      ...prev,
      additionalScriptures: prev.additionalScriptures.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleScriptureChange = (index, value) => {
    setSermonData((prev) => ({
      ...prev,
      additionalScriptures: prev.additionalScriptures.map((scripture, i) =>
        i === index ? value : scripture
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !sermonData.sermonTitle ||
      !sermonData.sermonDate ||
      !sermonData.contentText
    ) {
      alert("제목, 날짜, 내용은 필수 입력사항입니다.");
      return;
    }

    try {
      if (!userId) {
        alert("로그인이 필요합니다.");
        return;
      }

      const cleanContent = sermonData.contentText.replace(
        /<span class="ql-cursor">.*?<\/span>/g,
        ""
      );

      const submitData = {
        ...sermonData,
        // 예배 종류가 '기타'일 경우 customWorshipType을 사용
        worshipType:
          sermonData.worshipType === "기타"
            ? sermonData.customWorshipType
            : sermonData.worshipType,
        contentText: cleanContent,
        userId,
        createdAt: new Date().toISOString(),
      };

      delete submitData.customWorshipType;

      const response = await createSermon(submitData);

      if (response && response.sermonId) {
        alert("설교가 성공적으로 등록되었습니다.");
        navigate("/main/sermon-list");
      } else {
        throw new Error("설교 등록에 실패했습니다.");
      }
    } catch (error) {
      alert(`설교 등록 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  return (
    <Container>
      <Header>
        <TitleInput
          type="text"
          placeholder="설교 제목을 입력하세요"
          value={sermonData.sermonTitle}
          onChange={(e) => handleInputChange(e)}
          name="sermonTitle"
        />
        <HeaderControls>
          <MetaButton
            onClick={() => setIsMetaOpen(!isMetaOpen)}
            isOpen={isMetaOpen}
          >
            <span>추가정보</span>
            <ChevronDown size={16} />
          </MetaButton>
          <PublishButton onClick={handleSubmit}>추가하기</PublishButton>
        </HeaderControls>
      </Header>

      <MetaPanel isOpen={isMetaOpen}>
        <MetaGrid isOpen={isMetaOpen}>
          <MetaSection>
            <MetaLabel>설교 날짜</MetaLabel>
            <DateInput
              type="date"
              name="sermonDate"
              value={sermonData.sermonDate}
              onChange={handleInputChange}
            />
          </MetaSection>

          <MetaSection>
            <MetaLabel>예배 종류</MetaLabel>
            <Select
              name="worshipType"
              value={sermonData.worshipType}
              onChange={handleInputChange}
            >
              <option value="">예배 종류 선택</option>
              {WORSHIP_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
            {sermonData.worshipType === "기타" && (
              <CustomInputWrapper>
                <Input
                  type="text"
                  name="customWorshipType"
                  value={sermonData.customWorshipType}
                  onChange={handleInputChange}
                  placeholder="예배 종류를 입력하세요"
                />
              </CustomInputWrapper>
            )}
          </MetaSection>

          <MetaSection>
            <MetaLabel>성경 구절</MetaLabel>
            <ScriptureInputs>
              <Input
                type="text"
                name="mainScripture"
                value={sermonData.mainScripture}
                onChange={handleInputChange}
                placeholder="예: 요한복음 3:16"
              />
              <AddButton type="button" onClick={handleAddScripture}>
                <Plus size={16} />
              </AddButton>
            </ScriptureInputs>
            {sermonData.additionalScriptures.map((scripture, index) => (
              <AdditionalScriptureInput key={index}>
                <Input
                  type="text"
                  value={scripture}
                  onChange={(e) => handleScriptureChange(index, e.target.value)}
                  placeholder="추가 성경 구절"
                />
                <RemoveButton onClick={() => handleRemoveScripture(index)}>
                  <X size={16} />
                </RemoveButton>
              </AdditionalScriptureInput>
            ))}
          </MetaSection>

          <MetaSection>
            <MetaLabel>설교 요약</MetaLabel>
            <TextArea
              name="summary"
              value={sermonData.summary}
              onChange={handleInputChange}
              placeholder="설교의 핵심 내용을 요약해주세요"
              rows={3}
            />
          </MetaSection>

          <MetaSection>
            <MetaLabel>공개 설정</MetaLabel>
            <PrivacyToggle>
              <ToggleSwitch>
                <input
                  type="checkbox"
                  checked={sermonData.public}
                  onChange={(e) =>
                    setSermonData((prev) => ({
                      ...prev,
                      public: e.target.checked,
                    }))
                  }
                />
                <span />
              </ToggleSwitch>
              <PrivacyLabel>
                {sermonData.public ? (
                  <>
                    <Unlock size={16} />
                    전체 공개
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    비공개
                  </>
                )}
              </PrivacyLabel>
            </PrivacyToggle>
          </MetaSection>
        </MetaGrid>
      </MetaPanel>

      <EditorContainer>
        <SermonEditor ref={editorRef} onChange={handleEditorChange} />
      </EditorContainer>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 100;
  height: 57px;
`;

const TitleInput = styled.input`
  border: none;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  width: 100%;
  max-width: 600px;
  padding: 8px 0;

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
  }
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const MetaButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    transition: transform 0.3s ease;
    transform: rotate(${(props) => (props.isOpen ? "180deg" : "0deg")});
  }

  &:hover {
    background: #f8f9fa;
    border-color: #666;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const PublishButton = styled.button`
  padding: 8px 24px;
  background: #482895;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #3a2570;
  }
`;

const MetaPanel = styled.div`
  padding: 24px 32px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 90px;
  z-index: 99;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top;
  overflow: hidden;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  transform: translateY(${(props) => (props.isOpen ? "0" : "-10px")});
  max-height: ${(props) => (props.isOpen ? "1000px" : "0")};
  pointer-events: ${(props) => (props.isOpen ? "all" : "none")};
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  transform: translateY(${(props) => (props.isOpen ? "0" : "-10px")});
`;

const MetaSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const MetaLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #482895;
  margin-bottom: 4px;
`;

const Input = styled.input`
  padding: 10px 16px;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #482895;
    box-shadow: 0 0 0 3px rgba(72, 40, 149, 0.1);
  }
`;

const Select = styled(Input).attrs({ as: "select" })`
  cursor: pointer;
`;

const TextArea = styled(Input).attrs({ as: "textarea" })`
  resize: vertical;
  min-height: 80px;
`;

const ScriptureInputs = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const EditorContainer = styled.div`
  flex: 1;
  padding: 32px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;

  .ql-editor {
    min-height: 600px;
    font-size: 16px;
    line-height: 1.8;
  }
`;

const PrivacyToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + span {
      background-color: #4f3296;
    }

    &:checked + span:before {
      transform: translateX(24px);
    }
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }
  }
`;

const PrivacyLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 0.9rem;

  svg {
    color: #4f3296;
  }
`;

const DateInput = styled(Input)`
  padding-left: 40px;
  position: relative;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>');
  background-repeat: no-repeat;
  background-position: 12px center;
  background-size: 16px;

  &::-webkit-calendar-picker-indicator {
    background: transparent;
    bottom: 0;
    color: transparent;
    cursor: pointer;
    height: auto;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: auto;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px dashed #482895;
  border-radius: 8px;
  background: white;
  color: #482895;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    transform: translateY(-1px);
  }
`;

const AdditionalScriptureInput = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 8px;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #ff4444;
  }
`;

const CustomInputWrapper = styled.div`
  margin-top: 8px;
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

export default AddSermonPage;

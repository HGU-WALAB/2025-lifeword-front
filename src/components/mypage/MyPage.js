import React, { useState } from "react";
import styled from "styled-components";
import { User, Mail, Shield, Award, Lock } from "lucide-react";
import { setUserPassword } from "../../services/APIService";
import PasswordModal from "./PasswordModal";
import BookmarkPage from "./BookmarkPage";
import { useUserState } from "../../recoil/utils";

const MyPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordMatchMessage, setPasswordMatchMessage] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { userEmail, userJob: job, isAdmin } = useUserState();

  const handlePasswordChange = async () => {
    if (!newPassword) {
      alert("새로운 비밀번호를 입력해주세요.");
      return;
    }
    // 비밀번호 변경 API 호출
    const response = await setUserPassword(userEmail, newPassword);
    if (response.success) {
      alert("비밀번호가 성공적으로 변경되었습니다.");
      setShowPasswordModal(false);
      setNewPassword("");
      setNewPasswordConfirm("");
    } else {
      alert("기존 비밀번호와 동일한 비밀번호 입니다.");
    }
  };

  const handlePasswordCheckChange = (value) => {
    setNewPassword(value);
    if (!newPasswordConfirm) {
      setPasswordMatchMessage("");
      return;
    }
    setPasswordMatchMessage(
      value === newPasswordConfirm
        ? "비밀번호가 일치합니다."
        : "비밀번호가 일치하지 않습니다."
    );
  };

  const handlePasswordConfirmChange = (value) => {
    setNewPasswordConfirm(value);
    if (!newPassword) {
      setPasswordMatchMessage("");
      return;
    }
    setPasswordMatchMessage(
      value === newPassword
        ? "비밀번호가 일치합니다."
        : "비밀번호가 일치하지 않습니다."
    );
  };

  return (
    <Container>
      <HeaderSection>
        <ColumnContainer>
          <UserInfoContainer>
            <HeaderIcon>
              <User size={32} />
            </HeaderIcon>
            <UserDetails>
              <DetailRow>
                <DetailText>이름 / 지역 / 교회</DetailText>
              </DetailRow>
              <DetailRow>
                <CardIcon>
                  <Mail size={20} />
                  <Value>{userEmail}</Value>
                </CardIcon>
              </DetailRow>
            </UserDetails>
          </UserInfoContainer>

          <Column>
            <InfoCard>
              <CardIcon>
                <Award size={20} />
              </CardIcon>
              <Label>직분</Label>
              <Value>{job}</Value>
            </InfoCard>
          </Column>

          <Column>
            <InfoCard>
              <CardIcon>
                <Shield size={20} />
              </CardIcon>
              <Label>권한</Label>
              <Value>{isAdmin ? "관리자" : "일반 사용자"}</Value>
            </InfoCard>
          </Column>
        </ColumnContainer>

        {/* 비밀번호 변경 Section */}
        <PasswordColumn>
          <PasswordManagement>
            <PasswordRow>
              <CardIcon>
                <Lock size={20} />
              </CardIcon>
              <Label>비밀번호 관리</Label>
            </PasswordRow>
            <ChangePasswordButton onClick={() => setShowPasswordModal(true)}>
              비밀번호 변경하기
            </ChangePasswordButton>
          </PasswordManagement>
        </PasswordColumn>
      </HeaderSection>

      {showPasswordModal && (
        <PasswordModal
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          newPasswordConfirm={newPasswordConfirm}
          setNewPasswordConfirm={setNewPasswordConfirm}
          passwordMatchMessage={passwordMatchMessage}
          handlePasswordCheckChange={handlePasswordCheckChange}
          handlePasswordConfirmChange={handlePasswordConfirmChange}
          handlePasswordChange={handlePasswordChange}
          onClose={() => {
            setShowPasswordModal(false);
            setNewPassword("");
            setNewPasswordConfirm("");
          }}
        />
      )}

      {/* 북마크 페이지 나오세 하는거...*/}
      <BookmarkSection>
        <BookmarkPage />
      </BookmarkSection>
    </Container>
  );
};

export default MyPage;

const Container = styled.div`
  padding: 40px;
  background-color: white;
`;

const HeaderSection = styled.div`
  padding: 20px 40px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  background: white;
  border: 1px solid #e1e1e1;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  gap: 20px;

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ColumnContainer = styled.div`
  display: flex;
  flex: 1;
  gap: 20px;

  @media (max-width: 1024px) {
    flex-direction: column;
    width: 100%;
  }
`;

const Column = styled.div`
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 200px;
  white-space: nowrap;

  @media (max-width: 1024px) {
    align-items: center;
  }
`;

const DetailRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const DetailText = styled.span`
  font-size: 1.1rem;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
`;

const PasswordColumn = styled.div`
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const PasswordManagement = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const PasswordRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BookmarkSection = styled.div`
  margin-top: 30px;
`;

const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: nowrap;

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const HeaderIcon = styled.div`
  width: 3rem;
  height: 3rem;
  background: #4f3296;
  color: white;
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ChangePasswordButton = styled.button`
  background: #4f3296;
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  font-weight: 500;
  width: 100%;
  &:hover {
    background: #3a2570;
    transform: translateY(-2px);
  }
  @media (max-width: 768px) {
    padding: 0.8rem 1.2rem;
    font-size: 0.9rem;
  }
`;

const InfoCard = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  background: #f3f4f6;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 1.2rem;
  }
`;

const CardIcon = styled.div`
  color: #4f3296;
  display: flex;
  align-items: center;
`;

const Label = styled.span`
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
`;

const Value = styled.div`
  color: #333;
  font-size: 1.1rem;
  font-weight: 500;
`;

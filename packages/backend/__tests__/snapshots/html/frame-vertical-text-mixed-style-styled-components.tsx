import React from "react";
import styled from "styled-components";

const StyledDescriptionspan01 = styled.span`
  color: black;
  font-size: 18px;
  font-family: Noto Sans;
  font-weight: 400;
  line-height: 28px;
  word-wrap: break-word;
`;

const StyledDescriptionspan02 = styled.span`
  color: black;
  font-size: 18px;
  font-family: Noto Sans;
  font-weight: 700;
  line-height: 28px;
  word-wrap: break-word;
`;

const StyledDescriptionspan03 = styled.span`
  color: black;
  font-size: 18px;
  font-family: Noto Sans;
  font-weight: 400;
  line-height: 28px;
  word-wrap: break-word;
`;

const StyledDescription = styled.p`
  width: 102px;
  height: 56px;
`;

const StyledTextBox = styled.div`
  padding-bottom: 75px;
  background: white;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 16px;
  display: inline-flex;
`;

export const Textbox = () => {
  return (
    <StyledTextBox>
      <StyledDescription><StyledDescriptionspan01>Hel</StyledDescriptionspan01><StyledDescriptionspan02>lo, Wo</StyledDescriptionspan02><StyledDescriptionspan03>rld!</StyledDescriptionspan03></StyledDescription>
    </StyledTextBox>
  );
};
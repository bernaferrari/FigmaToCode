import React from "react";
import styled from "styled-components";

const StyledDescriptionspan = styled.span`
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

export const Description = () => {
  return (
    <StyledDescription><StyledDescriptionspan>Hello, World!</StyledDescriptionspan></StyledDescription>
  );
};
import React from 'react';
import styled from 'styled-components';
import { useAppContext } from '../../context/AppContext.jsx';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const ViewerContainer = styled.div`
  padding: 12px;
  font-family: 'Segoe UI', 'sans-serif';
  font-size: 13px;
  color: #d4d4d4;
  background: transparent;
  height: 100%;
  overflow-y: auto;
`;

const Title = styled.div`
  font-weight: 600;
  letter-spacing: 1px;
  font-size: 12px;
  color: #bdbdbd;
  padding: 0 0 8px 0;
  border-bottom: 1px solid #23232a;
  margin-bottom: 8px;
`;

const NoTextShadow = styled.div`
  & * {
    text-shadow: none !important;
  }
  & .token.punctuation,
  & .token.operator,
  & .token,
  & span {
    background: none !important;
    box-shadow: none !important;
  }
`;

const GlobalStateViewer = () => {
  const { state } = useAppContext();
  return (
    <ViewerContainer>
      <Title>GLOBAL STATE</Title>
      <NoTextShadow>
        <SyntaxHighlighter
          language="json"
          style={atomOneDark}
          customStyle={{
            borderRadius: 8,
            fontSize: 15,
            fontFamily: 'Fira Mono, Consolas, monospace',
            padding: 20,
            margin: 0,
            background: 'transparent',
            border: '1.5px solid #23232a',
            lineHeight: 1.7,
            wordBreak: 'break-all',
          }}
        >
          {JSON.stringify(state, null, 2)}
        </SyntaxHighlighter>
      </NoTextShadow>
    </ViewerContainer>
  );
};

export default GlobalStateViewer; 
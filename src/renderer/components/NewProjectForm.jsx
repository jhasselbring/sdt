import React, { useState } from 'react';
import styled from 'styled-components';

const ModalContainer = styled.div.attrs({
  id: 'modal-container'
})`
  background: #232136;
  color: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  min-width: 400px;
  max-width: 90vw;
  padding: 32px 28px 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Title = styled.h2`
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const Description = styled.p`
  margin: 0 0 24px 0;
  color: #b0b0c3;
  font-size: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Label = styled.label`
  font-size: 0.98rem;
  margin-bottom: 4px;
`;

const Input = styled.input`
  padding: 8px 10px;
  border-radius: 5px;
  border: 1px solid #39395a;
  background: #181825;
  color: #fff;
  font-size: 1rem;
  outline: none;
  &:focus {
    border-color: #3b82f6;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
`;

const Button = styled.button`
  padding: 8px 22px;
  border-radius: 5px;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  background: ${({ $primary }) => ($primary ? '#3b82f6' : '#39395a')};
  color: #fff;
  transition: background 0.15s;
  &:hover {
    background: ${({ $primary }) => ($primary ? '#2563eb' : '#232136')};
  }
`;

const NewProjectWizardModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [inputDir, setInputDir] = useState('');
  const [outputDir, setOutputDir] = useState('');
  const [maxHeight, setMaxHeight] = useState('');
  const [maxWidth, setMaxWidth] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !inputDir.trim() || !outputDir.trim()) {
      setError('Project name, input and output directories are required.');
      return;
    }

    const parsedHeight = maxHeight ? parseInt(maxHeight, 10) : null;
    const parsedWidth = maxWidth ? parseInt(maxWidth, 10) : null;

    if ((maxHeight && isNaN(parsedHeight)) || (maxWidth && isNaN(parsedWidth))) {
      setError('Max height and width must be valid numbers.');
      return;
    }

    setError('');
    if (onCreate) {
      onCreate({
        name,
        inputDir,
        outputDir,
        maxHeight: parsedHeight,
        maxWidth: parsedWidth,
      });
    }
  };

  return (
    <ModalContainer>
      <Title>New Project</Title>
      <Description>Set up a new project by providing a name and directories for input and output files.</Description>
      <Form onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="project-name">Project Name</Label>
          <Input
            id="project-name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter project name"
            autoFocus
          />
        </div>
        <div>
          <Label htmlFor="input-dir">Input Directory</Label>
          <Input
            id="input-dir"
            value={inputDir}
            onChange={e => setInputDir(e.target.value)}
            placeholder="e.g. C:/Users/You/Images"
          />
        </div>
        <div>
          <Label htmlFor="output-dir">Output Directory</Label>
          <Input
            id="output-dir"
            value={outputDir}
            onChange={e => setOutputDir(e.target.value)}
            placeholder="e.g. C:/Users/You/Output"
          />
        </div>
        <div>
          <Label htmlFor="max-height">Max Height (px)</Label>
          <Input
            id="max-height"
            type="number"
            value={maxHeight}
            onChange={e => setMaxHeight(e.target.value)}
            placeholder="e.g. 1080"
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="max-width">Max Width (px)</Label>
          <Input
            id="max-width"
            type="number"
            value={maxWidth}
            onChange={e => setMaxWidth(e.target.value)}
            placeholder="e.g. 1920"
            min="0"
          />
        </div>
        {error && <div style={{ color: '#f87171', fontSize: '0.95rem', marginTop: 4 }}>{error}</div>}
        <ButtonRow>
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" $primary>Create</Button>
        </ButtonRow>
      </Form>
    </ModalContainer>
  );
};

export default NewProjectWizardModal;

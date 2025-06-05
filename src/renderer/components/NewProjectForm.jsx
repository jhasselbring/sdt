import React, { useState, useEffect } from 'react';
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

const NewProjectForm = ({ onClose }) => {
  const [name, setName] = useState('dev123');
  const [inputDir, setInputDir] = useState('A:/Tools/Training/SD Training Input/20250604');
  const [outputDir, setOutputDir] = useState('A:/Tools/Training/SD Training Datasets/20250604');
  const [projectSaveLocation, setProjectSaveLocation] = useState('A:/Tools/Training/SD Training Projects/dev123.sqlite');
  const [maxHeight, setMaxHeight] = useState(512);
  const [maxWidth, setMaxWidth] = useState(512);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !inputDir.trim() || !outputDir.trim() || !projectSaveLocation.trim()) {
      setError('Project name, input, output, and save location directories are required.');
      return;
    }

    const parsedHeight = maxHeight ? parseInt(maxHeight, 10) : 512;
    const parsedWidth = maxWidth ? parseInt(maxWidth, 10) : 512;

    if ((maxHeight && isNaN(parsedHeight)) || (maxWidth && isNaN(parsedWidth))) {
      setError('Max height and width must be valid numbers.');
      return;
    }

    setError(''); // Clear previous errors

    try {
      const result = await window.electronAPI?.data?.createProject?.({
        name,
        inputDir,
        outputDir,
        projectSaveLocation,
        maxHeight: parsedHeight,
        maxWidth: parsedWidth,
      });

      if (result && result.success) {
        console.log('Project created successfully:', result.data);
        onClose(); // Close modal on success
      } else {
        setError(result?.error || 'Failed to create project. Unknown error.');
      }
    } catch (err) {
      console.error('Error calling createProject:', err);
      setError(err.message || 'An unexpected error occurred during project creation.');
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
          <div style={{ display: 'flex', gap: '8px' }}>
            <Input
              id="input-dir"
              value={inputDir}
              onChange={e => setInputDir(e.target.value)}
              placeholder="e.g. C:/Users/You/Images"
              style={{ flex: 1 }}
            />
            <Button
              type="button"
              onClick={async () => {
                const dir = await window.electronAPI?.fileSystem?.selectDirectory?.();
                if (dir) setInputDir(dir);
              }}
              style={{ padding: '8px 12px', minWidth: 0 }}
            >
              Browse
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="output-dir">Output Directory</Label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Input
              id="output-dir"
              value={outputDir}
              onChange={e => setOutputDir(e.target.value)}
              placeholder="e.g. C:/Users/You/Output"
              style={{ flex: 1 }}
            />
            <Button
              type="button"
              onClick={async () => {
                const dir = await window.electronAPI?.fileSystem?.selectDirectory?.();
                if (dir) setOutputDir(dir);
              }}
              style={{ padding: '8px 12px', minWidth: 0 }}
            >
              Browse
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="project-save-location">Project Save Location</Label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Input
              id="project-save-location"
              value={projectSaveLocation}
              onChange={e => setProjectSaveLocation(e.target.value)}
              placeholder="e.g. C:/Users/You/Projects/MyProject.sdt"
              style={{ flex: 1 }}
            />
            <Button
              type="button"
              onClick={async () => {
                const suggestedName = name?.trim() ? `${name.trim()}.sdt` : 'project.sdt';
                const file = await window.electronAPI?.fileSystem?.saveProjectFile?.(suggestedName);
                if (file) setProjectSaveLocation(file);
              }}
              style={{ padding: '8px 12px', minWidth: 0 }}
            >
              Browse
            </Button>
          </div>
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

export default NewProjectForm;

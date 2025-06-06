import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

// Styled components
const ViewerContainer = styled.div`
  padding: 10px;
  font-family: sans-serif;
  height: 100%;
  overflow-y: auto;
  color: #8c8a8c;
  width: 100vw;
`;

const DirectorySection = styled.div`
  margin-bottom: 8px;
`;

const DirectoryHeader = styled.div`
  background-color:rgb(39, 11, 56);
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover {
    background-color:rgb(51, 18, 71);
  }
`;

const DirectoryName = styled.span`
  font-weight: bold;
`;

const FileListing = styled.ul`
  list-style-type: none;
  padding-left: 20px;
  margin-top: 5px;
`;

const FileItem = styled.li`
  padding: 4px 0;
  font-size: 0.9em;
  display: flex;
  align-items: center;
`;

const FolderItem = styled(FileItem)`
  font-weight: bold;
  cursor: pointer;
`;

const Icon = styled.span`
  margin-right: 8px;
  display: inline-block;
  width: 16px; /* Ensure consistent width for alignment */
  text-align: center;
`;

const StatusIndicator = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => {
    switch (props.status) {
      case 'new': return 'blue';
      case 'updated': return 'orange';
      case 'missing': return 'red';
      case 'found': return 'green';
      default: return 'grey';
    }
  }};
  margin-left: 8px;
  margin-right: 5px;
  box-shadow: 0 0 0 2px #8c8a8c;
`;


// Helper function to parse paths and build a tree-like structure
const buildFileTree = (files) => {
  const tree = {};

  files.forEach(file => {
    const parts = file.relative_path.split(/[\\\\/]/); // Split by path separator
    let currentLevel = tree;
    parts.forEach((part, index) => {
      if (!currentLevel[part]) {
        currentLevel[part] = {
          _isFolder: index < parts.length - 1,
          _name: part,
          _path: parts.slice(0, index + 1).join('/'), // Full path for this part
          _files: [], // Files directly in this folder (not used by current renderTree if files are only leaves)
          _subFolders: {}, // Subfolders
        };
      }
      if (index === parts.length - 1 && !currentLevel[part]._isFolder) { // It's a file leaf
        currentLevel[part]._fileData = file;
        currentLevel[part]._isFolder = false; // Explicitly mark as not a folder
      } else if (index < parts.length - 1) { // It's a directory part
         currentLevel[part]._isFolder = true; // Ensure it's marked as folder
         if(!currentLevel[part]._subFolders) currentLevel[part]._subFolders = {}; // ensure subFolders exists
         currentLevel = currentLevel[part]._subFolders;
      } else { // It's a file but encountered as a part of a path for another file
        currentLevel = currentLevel[part];
      }
    });
  });
  return tree;
};


const renderTree = (node, level = 0, onFileClick) => {
  if (!node) return null;

  return Object.values(node).map(item => {
    if (item._isFolder) {
      return (
        <React.Fragment key={item._path}>
          <FolderItem style={{ paddingLeft: `${level * 20}px` }} onClick={() => onFileClick?.(item, true)}>
            <Icon>📁</Icon> {/* Folder icon (unicode) */}
            {item._name}
          </FolderItem>
          {renderTree(item._subFolders, level + 1, onFileClick)}
        </React.Fragment>
      );
    }
    // Render file if _fileData exists (leaf node)
    if (item._fileData) {
        const file = item._fileData;
        return (
            <FileItem key={file.id} style={{ paddingLeft: `${level * 20}px` }} onClick={() => onFileClick?.(file, false)}>
                <StatusIndicator status={file.status} title={file.status} />
                <Icon>📄</Icon> {/* File icon (unicode) */}
                {item._name}
            </FileItem>
        );
    }
    return null;
  });
};


const InputFileViewer = () => {
  const [inputDirectories, setInputDirectories] = useState([]);
  const [filesByDirectory, setFilesByDirectory] = useState({});
  const [expandedDirectories, setExpandedDirectories] = useState(new Set());
  const [error, setError] = useState(null);
  const [loadingStates, setLoadingStates] = useState({}); // Track loading per directory

  useEffect(() => {
    const fetchDirs = async () => {
      try {
        setError(null);
        const result = await window.electronAPI?.data?.getAllInputDirectories?.();
        if (result && result.success) {
          setInputDirectories(result.data || []);
        } else {
          console.error('Failed to fetch input directories:', result?.error);
          setError(result?.error || 'Failed to fetch input directories.');
        }
      } catch (err) {
        console.error('Error fetching input directories:', err);
        setError(err.message);
      }
    };
    fetchDirs();
  }, []);

  const toggleDirectory = useCallback(async (dirId) => {
    const newExpanded = new Set(expandedDirectories);
    if (newExpanded.has(dirId)) {
      newExpanded.delete(dirId);
    } else {
      newExpanded.add(dirId);
      if (!filesByDirectory[dirId] && !loadingStates[dirId]) { // Check loading state too
        setLoadingStates(prev => ({ ...prev, [dirId]: true }));
        try {
          const result = await window.electronAPI?.data?.getFilesInDirectory?.(dirId);
          if (result && result.success) {
            const tree = buildFileTree(result.data || []);
            setFilesByDirectory(prev => ({ ...prev, [dirId]: tree }));
          } else {
            console.error(`Failed to fetch files for dir ${dirId}:`, result?.error);
            setFilesByDirectory(prev => ({ ...prev, [dirId]: {} })); // Set empty tree on error
          }
        } catch (err) {
          console.error(`Error fetching files for dir ${dirId}:`, err);
          setFilesByDirectory(prev => ({ ...prev, [dirId]: {} })); // Set empty tree on error
        } finally {
          setLoadingStates(prev => ({ ...prev, [dirId]: false }));
        }
      }
    }
    setExpandedDirectories(newExpanded);
  }, [expandedDirectories, filesByDirectory, loadingStates]);

  const handleFileItemClick = (item, isFolder) => {
    console.log(isFolder ? 'Folder clicked:' : 'File clicked:', item);
    if (!isFolder && item.absolute_path) {
        // Example: IPC call to open file or show preview
        // window.electronAPI?.fileSystem?.openFile?.(item.absolute_path);
    }
  };


  if (error) {
    return <ViewerContainer>Error: {error}</ViewerContainer>;
  }

  return (
    <ViewerContainer>
      {inputDirectories.length === 0 && !error && <p>No input directories configured.</p>}
      {inputDirectories.map(dir => (
        <DirectorySection key={dir.id}>
          <DirectoryHeader onClick={() => toggleDirectory(dir.id)}>
            <DirectoryName>
              <Icon>{expandedDirectories.has(dir.id) ? '▼' : '▶'}</Icon> {/* Unicode carets */}
              {dir.path}
            </DirectoryName>
            {loadingStates[dir.id] && <span>Loading...</span>}
          </DirectoryHeader>
          {expandedDirectories.has(dir.id) && filesByDirectory[dir.id] && (
            <FileListing>
              {Object.keys(filesByDirectory[dir.id]).length === 0 && !loadingStates[dir.id] ? (
                <li>No files in this directory.</li>
              ) : (
                renderTree(filesByDirectory[dir.id], 0, handleFileItemClick)
              )}
            </FileListing>
          )}
          {expandedDirectories.has(dir.id) && !filesByDirectory[dir.id] && !loadingStates[dir.id] && (
             <FileListing><li>Click to load files or directory is empty.</li></FileListing>
          )}
        </DirectorySection>
      ))}
    </ViewerContainer>
  );
};

export default InputFileViewer; 
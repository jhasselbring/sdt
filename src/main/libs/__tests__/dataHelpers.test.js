import { validateNewProjectData } from '../dataHelpers.js';
import fs from 'node:fs';
import path from 'node:path';

// Mock fs module
jest.mock('node:fs', () => ({
  existsSync: jest.fn()
}));

describe('validateNewProjectData', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  const validProjectData = {
    inputDir: '/valid/input/path',
    outputDir: '/valid/output/path',
    projectSaveLocation: '/valid/project/path/project.sdt',
    name: 'Test Project',
    maxHeight: 1000,
    maxWidth: 1000
  };

  it('should validate correct project data', async () => {
    // Mock fs.existsSync to return true for all paths
    fs.existsSync.mockImplementation(() => true);

    const result = await validateNewProjectData(validProjectData);
    expect(result).toEqual({
      ...validProjectData,
      validated: true
    });
  });

  it('should reject when input directory is missing', async () => {
    const invalidData = { ...validProjectData, inputDir: '' };
    await expect(validateNewProjectData(invalidData)).rejects.toEqual({
      success: false,
      error: 'Input directory is required and must exist'
    });
  });

  it('should reject when input directory does not exist', async () => {
    fs.existsSync.mockImplementation((path) => path !== validProjectData.inputDir);
    await expect(validateNewProjectData(validProjectData)).rejects.toEqual({
      success: false,
      error: 'Input directory is required and must exist'
    });
  });

  it('should reject when output directory is missing', async () => {
    const invalidData = { ...validProjectData, outputDir: '' };
    await expect(validateNewProjectData(invalidData)).rejects.toEqual({
      success: false,
      error: 'Output directory is required and must exist'
    });
  });

  it('should reject when output directory does not exist', async () => {
    fs.existsSync.mockImplementation((path) => path !== validProjectData.outputDir);
    await expect(validateNewProjectData(validProjectData)).rejects.toEqual({
      success: false,
      error: 'Output directory is required and must exist'
    });
  });

  it('should reject when project save location is missing', async () => {
    const invalidData = { ...validProjectData, projectSaveLocation: '' };
    await expect(validateNewProjectData(invalidData)).rejects.toEqual({
      success: false,
      error: 'Project save location is required and parent directory must exist'
    });
  });

  it('should reject when project save location parent directory does not exist', async () => {
    fs.existsSync.mockImplementation((path) => path !== path.dirname(validProjectData.projectSaveLocation));
    await expect(validateNewProjectData(validProjectData)).rejects.toEqual({
      success: false,
      error: 'Project save location is required and parent directory must exist'
    });
  });

  it('should reject when project name is missing', async () => {
    const invalidData = { ...validProjectData, name: '' };
    await expect(validateNewProjectData(invalidData)).rejects.toEqual({
      success: false,
      error: 'Project name is required'
    });
  });

  it('should reject when max height is invalid', async () => {
    const invalidData = { ...validProjectData, maxHeight: 0 };
    await expect(validateNewProjectData(invalidData)).rejects.toEqual({
      success: false,
      error: 'Max height must be a positive number'
    });
  });

  it('should reject when max width is invalid', async () => {
    const invalidData = { ...validProjectData, maxWidth: -1 };
    await expect(validateNewProjectData(invalidData)).rejects.toEqual({
      success: false,
      error: 'Max width must be a positive number'
    });
  });

  it('should reject when project file already exists', async () => {
    fs.existsSync.mockImplementation((path) => path === validProjectData.projectSaveLocation);
    await expect(validateNewProjectData(validProjectData)).rejects.toEqual({
      success: false,
      error: 'Project file already exists. Please choose a different location or change the file name.'
    });
  });
}); 
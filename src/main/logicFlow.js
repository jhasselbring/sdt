import fs from 'node:fs';
import path from 'path';
import { initializeProjectDatabase, get } from './database.js';
import { scanInputDirectory, watchInputDirectory } from './services/fileSyncService.js';
import {
  getFilesByDirectoryId,
  getFileByAbsolutePath,
  insertFile,
  updateFile,
  updateFileByPath
} from './database.js';

/**
 * Chainable logic for project creation and file sync.
 *
 * Usage:
 *   createAndSyncProject(projectData)
 *     .then(result => ...)
 *     .catch(err => ...)
 */

/**
 * Validates project creation input data.
 * @param {object} projectData
 * @returns {object} { success: boolean, error?: string }
 */
export function validateProjectData(projectData) {
  const { inputDir, maxHeight, maxWidth, name, outputDir, projectSaveLocation } = projectData;
  if (!inputDir?.trim() || !fs.existsSync(inputDir)) {
    return { success: false, error: 'Input directory is required and must exist' };
  }
  if (!outputDir?.trim() || !fs.existsSync(outputDir)) {
    return { success: false, error: 'Output directory is required and must exist' };
  }
  if (!projectSaveLocation?.trim() || !fs.existsSync(path.dirname(projectSaveLocation))) {
    return { success: false, error: 'Project save location is required and parent directory must exist' };
  }
  if (!name?.trim()) {
    return { success: false, error: 'Project name is required' };
  }
  if (!maxHeight || isNaN(maxHeight) || maxHeight <= 0) {
    return { success: false, error: 'Max height must be a positive number' };
  }
  if (!maxWidth || isNaN(maxWidth) || maxWidth <= 0) {
    return { success: false, error: 'Max width must be a positive number' };
  }
  if (fs.existsSync(projectSaveLocation)) {
    return { success: false, error: 'Project file already exists. Please choose a different location or change the file name.' };
  }
  return { success: true };
}

/**
 * Creates a new project and initializes file sync.
 * Chainable: returns a Promise.
 * @param {object} projectData
 * @returns {Promise<object>} { success: boolean, data?: object, error?: string }
 */
export async function createAndSyncProject(projectData) {
  const validation = validateProjectData(projectData);
  if (!validation.success) return validation;

  const { inputDir, maxHeight, maxWidth, name, outputDir, projectSaveLocation } = projectData;
  try {
    const projectMetadata = {
      name,
      inputDir,
      outputDir,
      maxHeight,
      maxWidth,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await initializeProjectDatabase(projectSaveLocation, projectMetadata);

    // File sync logic
    const dbService = {
      getFilesByDirectoryId,
      getFileByAbsolutePath,
      insertFile,
      updateFile,
      updateFileByPath,
    };
    const inputDirectoryPath = projectMetadata.inputDir;
    if (inputDirectoryPath && typeof inputDirectoryPath === 'string') {
      try {
        const dirRecord = await get('SELECT id FROM input_directories WHERE path = ?', [inputDirectoryPath]);
        if (dirRecord && dirRecord.id) {
          const inputDirId = dirRecord.id;
          await scanInputDirectory(inputDirId, inputDirectoryPath, dbService);
          await watchInputDirectory(inputDirId, inputDirectoryPath, dbService);
        }
      } catch (syncError) {
        // Log and continue
        console.error(`[logicFlow] Error during file sync setup for ${inputDirectoryPath}:`, syncError);
      }
    }
    return { success: true, data: { projectSaveLocation } };
  } catch (error) {
    console.error('Failed to create project database:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create project database' };
  }
}

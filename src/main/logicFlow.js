import { validateNewProjectData } from './libs/dataHelpers.js';
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


/**
 * Creates a new project and initializes file sync.
 * Chainable: returns a Promise.
 * @param {object} projectData
 * @returns {Promise<object>} { success: boolean, data?: object, error?: string }
 */
export async function createAndSyncProject(projectData) {
  const validation = await validateProjectData(projectData);
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




export default {
  createNewAndLoadProject: (projectData) => {
    return validateNewProjectData(projectData)
    .catch(err => {
      return err;
    });
  }
};

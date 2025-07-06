import { validateNewProjectData } from '../libs/dataHelpers.js';
import { createProjectFile, openDb } from '../libs/databaseHelpers.js';

export default {
  createNewAndLoadProject: async (projectData) => {
    try {
      const validatedData = await validateNewProjectData(projectData);
      const result = await createProjectFile(validatedData);
      return { success: true, data: result };
      let newProjectData = await validateNewProjectData(projectData);
      newProjectData     = await createProjectFile(newProjectData);
      newProjectData     = await openDb(newProjectData);
      // Write initial data to newly created project file
      return newProjectData;
    } catch (error) {
      return { success: false, error: error.message || error.error || 'Failed to create project' };
      console.error('createNewAndLoadProject error:', error);
      return error;
    }
  }
};

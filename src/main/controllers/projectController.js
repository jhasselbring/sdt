import { validateNewProjectData } from '../libs/dataHelpers.js';
import { createProjectFile } from '../libs/databaseHelpers.js';

export default {
  createNewAndLoadProject: async (projectData) => {
    try {
      const validatedData = await validateNewProjectData(projectData);
      const result = await createProjectFile(validatedData);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message || error.error || 'Failed to create project' };
    }
  }
};

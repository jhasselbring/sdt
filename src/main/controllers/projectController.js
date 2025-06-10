import { validateNewProjectData } from '../libs/dataHelpers.js';
import { createProjectFile } from '../libs/databaseHelpers.js';

export default {
  createNewAndLoadProject: async (projectData) => {

    try {
      const projectData = validateNewProjectData(projectData);
      return createProjectFile(projectData);
    } catch (error) {
      return error;
    }
  }
};

import { validateNewProjectData } from '../libs/dataHelpers.js';
import { createProjectFile, openDb } from '../libs/databaseHelpers.js';

export default {
  createNewAndLoadProject: async (projectData) => {

    try {
      let newProjectData = await validateNewProjectData(projectData);
      newProjectData     = await createProjectFile(newProjectData);
      newProjectData     = await openDb(newProjectData);
      // Write initial data to newly created project file
      return newProjectData;
    } catch (error) {
      console.error('createNewAndLoadProject error:', error);
      return error;
    }
  }
};

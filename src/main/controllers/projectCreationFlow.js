import { validateNewProjectData } from '../libs/dataHelpers.js';
import { createProjectFile } from '../libs/databaseHelpers.js';

export default {
  createNewAndLoadProject: async (projectData) => {

    try {

    }catch (error) {

    }
    
    return validateNewProjectData(projectData)
      .then(createProjectFile)
      .then(projectData => {
        console.log('ALL SUCCESS SO FAR');
      })
      .catch(err => {
        return err;
      });

  }
};

import { validateNewProjectData } from '../libs/dataHelpers.js';


export default {
    createNewAndLoadProject: (projectData) => {
      return validateNewProjectData(projectData)
      .catch(err => {
        return err;
      });
    }
  };
  
import { validateNewProjectData } from '../libs/dataHelpers.js';
import { createProjectFile, openDb } from '../libs/databaseHelpers.js';
import discordLogger from '../services/discordLoggerService.js';

export default {
  createNewAndLoadProject: async (projectData) => {
    try {
      await discordLogger.info('🔄 [BACKEND] Creating new project', { 
        context: 'projectController.createNewAndLoadProject',
        process: 'main',
        projectData
      });
      
      const validatedData = await validateNewProjectData(projectData);
      await discordLogger.info('✅ [BACKEND] Project data validated', { 
        context: 'projectController.createNewAndLoadProject',
        process: 'main',
        validatedData
      });
      
      const result = await createProjectFile(validatedData);
      await discordLogger.info('✅ [BACKEND] Project file created', { 
        context: 'projectController.createNewAndLoadProject',
        process: 'main',
        result
      });
      
      return { success: true, data: result };
    } catch (error) {
      await discordLogger.logError(error, { 
        context: 'projectController.createNewAndLoadProject',
        projectData
      });
      return { success: false, error: error.message || error.error || 'Failed to create project' };
    }
  }
};

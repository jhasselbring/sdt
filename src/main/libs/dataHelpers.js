import fs from 'node:fs';
import path from 'node:path';

export function validateNewProjectData(projectData) {
    return new Promise((resolve, reject) => {
        const { inputDir, maxHeight, maxWidth, name, outputDir, projectSaveLocation } = projectData;

        if (!inputDir?.trim() || !fs.existsSync(inputDir)) {
            reject({ success: false, error: 'Input directory is required and must exist' });
        }
        if (!outputDir?.trim() || !fs.existsSync(outputDir)) {
            reject({ success: false, error: 'Output directory is required and must exist' });
        }
        if (!projectSaveLocation?.trim() || !fs.existsSync(path.dirname(projectSaveLocation))) {
            reject({ success: false, error: 'Project save location is required and parent directory must exist' });
        }
        if (!name?.trim()) {
            reject({ success: false, error: 'Project name is required' });
        }
        if (!maxHeight || isNaN(maxHeight) || maxHeight <= 0) {
            reject({ success: false, error: 'Max height must be a positive number' });
        }
        if (!maxWidth || isNaN(maxWidth) || maxWidth <= 0) {
            reject({ success: false, error: 'Max width must be a positive number' });
        }
        if (fs.existsSync(projectSaveLocation)) {
            reject({ success: false, error: 'Project file already exists. Please choose a different location or change the file name.' });
        }

        projectData.validated = true;
        
        resolve(projectData);
    });
}

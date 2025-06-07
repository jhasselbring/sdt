

export default {

    createProjectFile: (projectData) => {
        return new Promise((resolve, reject) => {
            const { inputDir, maxHeight, maxWidth, name, outputDir, projectSaveLocation } = projectData;
            
            try{
                resolve(new Database(filePath));
            } catch (error) {
                reject(error);
            }
            
        });
    }
}
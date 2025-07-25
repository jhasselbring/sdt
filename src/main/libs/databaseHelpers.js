import Database from 'better-sqlite3';
import { initializeProjectDatabase } from '../tmp/database.js';

let db = null;

export function createProjectFile(projectData) {
    const { projectSaveLocation, name, inputDir, outputDir, maxHeight, maxWidth } = projectData;

    return new Promise(async (resolve, reject) => {
        try {
            new Database(projectSaveLocation);
            resolve(projectData);
        } catch (error) {
            reject(error);
        }
    });
}
export function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call initializeDatabase first.');
    }
    return db;
}

export function closeDb() {
    if (db) {
        db.close();
        db = null;
        console.log('Database closed.');
    }
}

export function openDb(projectData) {
    closeDb();
    db = new Database(projectData.projectSaveLocation);
    projectData.projectFileOpened = true;
    return projectData
}
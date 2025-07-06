import Database from 'better-sqlite3';
import { initializeProjectDatabase } from '../tmp/database.js';

let db = null;

export function createProjectFile(projectData) {
    const { projectSaveLocation, name, inputDir, outputDir, maxHeight, maxWidth } = projectData;

    return new Promise(async (resolve, reject) => {
        try {
            // Create the database file
            const db = new Database(projectSaveLocation);
            
            // Initialize the database with project schema
            const metadata = {
                name,
                inputDir,
                outputDir,
                maxHeight,
                maxWidth,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            await initializeProjectDatabase(projectSaveLocation, metadata);
            
            resolve({ ...projectData, db });
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

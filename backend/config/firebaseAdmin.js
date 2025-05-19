// backend/config/firebaseAdmin.js
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url'; 

dotenv.config();

// Resolve path correctly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const serviceAccountPath = path.resolve(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_KEY_FILENAME);

try {
    if (!admin.apps.length) { // Prevent re-initializing
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath)
        });
        console.log('Firebase Admin SDK Initialized.');
    }
} catch (error) {
    console.error('Firebase Admin SDK Initialization Error:', error);
    console.error('Check if the service account key file exists at:', serviceAccountPath);
    console.error('Ensure FIREBASE_SERVICE_ACCOUNT_KEY_FILENAME is set in .env');
 
}


export default admin;
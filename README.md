# CrucialCars

CrucialCars is a platform that connects car owners with automotive journalists for test drives.

## Setting Up Google Authentication

To enable Google authentication in the CrucialCars app, follow these steps:

### 1. Firebase Console Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Add an app to your Firebase project:
   - Click on the Web icon (</>) to add a web app
   - Register the app with a nickname (e.g., "CrucialCars Web")
   - Copy the Firebase configuration object
4. Set up Authentication:
   - Go to "Authentication" in the left sidebar
   - Click on "Sign-in method" tab
   - Enable "Google" as a sign-in provider
   - Configure the authorized domains
5. Generate a service account key:
   - Go to Project Settings > Service accounts
   - Click "Generate new private key"
   - Save the JSON file as `firebaseServiceAccountKey.json` in the backend directory

### 2. Environment Configuration

1. Frontend Configuration:
   - Create a `.env` file in the `frontend` directory based on `.env.template`
   - Fill in the Firebase configuration values from the Firebase console

2. Backend Configuration:
   - Create a `.env` file in the `backend` directory based on `.env.template`
   - Ensure `FIREBASE_SERVICE_ACCOUNT_KEY_FILENAME` is set correctly

### 3. Start the Application

1. Start the backend server:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Features

- User authentication (Email/Password & Google Sign-In)
- Role-based access control (Car Owner and Journalist roles)
- Car listings and details
- Test drive request system
- Owner dashboard for managing cars and requests
- Journalist dashboard for managing test drive requests
- Image upload for cars

## Technologies Used

- Frontend: React, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT, Firebase Authentication
- Image Storage: Local file system

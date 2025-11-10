// Firebase configuration and initialization
// Replace these values with your Firebase project credentials

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
// Get these values from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase config is properly set
const isConfigValid = Object.values(firebaseConfig).every(value => value && value !== 'undefined');

if (!isConfigValid) {
  console.warn('Firebase configuration is missing. Please set up your .env file with Firebase credentials.');
  console.warn('See FIREBASE_SETUP.md for instructions.');
}

// Initialize Firebase
let app;
let auth;
let googleProvider;

try {
  if (isConfigValid) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  } else {
    console.warn('Firebase will not be initialized due to missing configuration.');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  console.error('Please check your Firebase configuration in .env file');
}

export { auth, googleProvider };
export default app;


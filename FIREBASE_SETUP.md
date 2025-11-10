# Firebase Google Authentication Setup Guide

This guide will help you set up Firebase Google Authentication for the AI-Powered Interview Portal.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Enable Google Authentication

1. In your Firebase project, go to **Authentication** > **Sign-in method**
2. Click on **Google** provider
3. Toggle **Enable** to enable Google sign-in
4. Enter your project's support email
5. Click **Save**

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click on the **Web** icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "MockMate")
5. Copy the Firebase configuration object

## Step 4: Set Up Environment Variables

1. Create a `.env` file in the root directory of your project
2. Add the following environment variables with your Firebase config values:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

3. Replace the placeholder values with your actual Firebase configuration values

## Step 5: Configure Authorized Domains

1. In Firebase Console, go to **Authentication** > **Settings** > **Authorized domains**
2. Add your local development domain: `localhost`
3. Add your production domain when you deploy

## Step 6: Test the Authentication

1. Start your development server: `npm run dev`
2. Navigate to the home page
3. Click on any button (e.g., "Start AI Practice", "Book Mock Interview")
4. The Google authentication popup should appear
5. Sign in with your Google account
6. After successful authentication, you should be redirected to the requested page

## Important Notes

- Never commit your `.env` file to version control
- The `.env` file is already included in `.gitignore`
- Make sure to set up environment variables in your deployment platform (Vercel, Netlify, etc.) when deploying

## Troubleshooting

### Authentication popup doesn't appear
- Check that all environment variables are set correctly
- Verify that Google authentication is enabled in Firebase Console
- Check browser console for error messages

### "Firebase: Error (auth/unauthorized-domain)"
- Add your domain to the authorized domains list in Firebase Console
- For local development, make sure `localhost` is in the authorized domains

### "Firebase: Error (auth/popup-closed-by-user)"
- This is normal if the user closes the popup without signing in
- The error is handled gracefully in the code

## Security Best Practices

1. Always use environment variables for sensitive configuration
2. Never expose your Firebase API keys in client-side code (except public keys)
3. Set up Firebase Security Rules for your Firestore/Realtime Database
4. Enable App Check for additional security
5. Regularly review and update your Firebase security settings


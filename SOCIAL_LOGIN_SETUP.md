# Social Login Setup Guide

This guide will help you set up Google and GitHub OAuth authentication for your E Store application.

## Prerequisites

- Node.js and npm installed
- MongoDB running locally or remotely
- Google Developer Console access
- GitHub Developer Settings access

## Backend Configuration

### 1. Environment Variables

Update your `backend/config.env` file with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/inventory_system

# JWT Secret
JWT_SECRET=your_secure_jwt_secret_here

# Frontend URL for OAuth callbacks
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

### 2. Google OAuth Setup

1. Go to [Google Developer Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Set the following:
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:5000/api/auth/google/callback`
7. Copy the Client ID and Client Secret to your `.env` file

### 3. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the following:
   - **Application name**: E Store
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
4. Click "Register application"
5. Copy the Client ID and Client Secret to your `.env` file

## Frontend Configuration

### 1. Install Dependencies

Make sure you have the required packages installed:

```bash
cd frontend
npm install react-hot-toast
```

### 2. Update Auth Context

Ensure your `useAuth` hook properly handles social login tokens.

## Testing the Setup

### 1. Start the Backend

```bash
cd backend
npm run dev
```

You should see these messages in the console:
- "Connected to MongoDB"
- "Google OAuth strategy initialized successfully" (if configured)
- "GitHub OAuth strategy initialized successfully" (if configured)

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

### 3. Test Social Login

1. Go to the login page
2. Click on Google or GitHub login button
3. You should be redirected to the respective OAuth provider
4. After authentication, you'll be redirected back to the callback page
5. The callback page should redirect you to the dashboard

## Troubleshooting

### Common Issues

1. **"OAuth is not configured" error**
   - Check that your environment variables are set correctly
   - Ensure the backend has been restarted after updating `.env`

2. **"Invalid redirect URI" error**
   - Verify the callback URLs match exactly in both Google/GitHub settings and your backend
   - Check that `FRONTEND_URL` is set correctly

3. **"Authentication failed" error**
   - Check the backend console for detailed error messages
   - Verify MongoDB connection
   - Check JWT_SECRET is set

4. **CORS errors**
   - Ensure the backend CORS configuration includes your frontend URL
   - Check that credentials are being sent with requests

### Debug Mode

To enable debug logging, add this to your backend:

```javascript
// In server.js
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}
```

## Security Considerations

1. **Never commit your `.env` file** to version control
2. **Use strong JWT secrets** in production
3. **Set appropriate OAuth scopes** (only request what you need)
4. **Implement rate limiting** for OAuth endpoints
5. **Use HTTPS** in production

## Production Deployment

1. Update `FRONTEND_URL` to your production domain
2. Update OAuth callback URLs in Google/GitHub settings
3. Set `NODE_ENV=production`
4. Use environment-specific MongoDB URIs
5. Implement proper error logging and monitoring

## Support

If you encounter issues:

1. Check the browser console for frontend errors
2. Check the backend console for server errors
3. Verify all environment variables are set
4. Ensure OAuth apps are properly configured
5. Check MongoDB connection and user model

## Next Steps

After successful setup:

1. Customize the user profile fields
2. Add avatar handling
3. Implement account linking/unlinking
4. Add social login to user settings
5. Implement proper error handling and user feedback

# Social Login Setup Guide

This guide explains how to set up social login (Google OAuth and GitHub OAuth) for your E Store application.

## 🚀 Features Added

- **Google OAuth 2.0** - Sign in with Google account
- **GitHub OAuth** - Sign in with GitHub account
- **Account Linking** - Link social accounts to existing users
- **Automatic User Creation** - Creates new users from social login
- **Profile Sync** - Syncs basic profile information from social accounts

## 📋 Prerequisites

1. **Google Developer Account** - For Google OAuth
2. **GitHub Developer Account** - For GitHub OAuth
3. **MongoDB** - Database for user storage
4. **Node.js & npm** - Backend runtime

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install passport passport-google-oauth20 passport-github2 passport-jwt passport-local
```

### 2. Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/inventory_system

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Frontend URL for OAuth callbacks
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
7. Copy the Client ID and Client Secret to your `.env` file

### 4. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: E Store
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
4. Copy the Client ID and Client Secret to your `.env` file

## 🎨 Frontend Setup

### 1. Install Icon Package

```bash
cd frontend
npm install react-icons
```

### 2. Components Added

- **`SocialLogin.tsx`** - Social login buttons component
- **`AuthCallback.tsx`** - Handles OAuth redirects
- **Updated Login/Register forms** - Include social login options
- **Settings page** - Social account management

## 🔐 How It Works

### 1. User Flow

1. User clicks "Sign in with Google" or "Sign in with GitHub"
2. Redirected to OAuth provider (Google/GitHub)
3. User authorizes the application
4. OAuth provider redirects back to your callback URL
5. Backend creates/updates user and generates JWT token
6. User is redirected to frontend with token
7. Frontend stores token and logs user in

### 2. Account Linking

- If a user signs in with social login and their email already exists, the accounts are linked
- Users can have multiple social accounts linked to one email
- Social accounts can be unlinked from settings (if they have a password set)

### 3. User Creation

- New users are automatically created from social login
- Username is generated from social profile data
- Basic profile information is synced (name, email, avatar)

## 🛠️ API Endpoints

### Social Login Routes

```
GET /api/auth/google          - Initiate Google OAuth
GET /api/auth/google/callback - Google OAuth callback
GET /api/auth/github          - Initiate GitHub OAuth
GET /api/auth/github/callback - GitHub OAuth callback
POST /api/auth/link-social    - Link social account to existing user
DELETE /api/auth/unlink-social - Unlink social account
```

## 🧪 Testing

### 1. Start Backend

```bash
cd backend
npm run dev
```

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

### 3. Test Social Login

1. Go to login/register page
2. Click "Sign in with Google" or "Sign in with GitHub"
3. Complete OAuth flow
4. Verify user is logged in and redirected to dashboard

## 🔒 Security Considerations

1. **HTTPS Required** - OAuth providers require HTTPS in production
2. **State Parameter** - Consider adding state parameter for CSRF protection
3. **Token Storage** - JWT tokens are stored in localStorage (consider httpOnly cookies for production)
4. **Scope Limitation** - Only request necessary scopes from OAuth providers

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Check that callback URLs match exactly in OAuth app settings
   - Ensure no trailing slashes or typos

2. **"Client ID not found"**
   - Verify environment variables are loaded correctly
   - Check that .env file is in the right location

3. **"CORS errors"**
   - Ensure backend CORS settings include frontend URL
   - Check that frontend URL in .env matches actual frontend URL

4. **"User not created"**
   - Check MongoDB connection
   - Verify User model schema changes are applied
   - Check server logs for errors

### Debug Steps

1. Check browser console for frontend errors
2. Check backend server logs
3. Verify environment variables are loaded
4. Test OAuth endpoints directly
5. Check MongoDB for user creation

## 📱 Production Deployment

### 1. Update Environment Variables

```env
FRONTEND_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret
GITHUB_CLIENT_ID=your_production_github_client_id
GITHUB_CLIENT_SECRET=your_production_github_client_secret
```

### 2. Update OAuth App Settings

- Update callback URLs to production domain
- Ensure HTTPS is enabled
- Update application homepage URL

### 3. Security Headers

Add security headers to your production server:
- HSTS
- CSP (Content Security Policy)
- X-Frame-Options

## 🎯 Next Steps

1. **Add More Providers** - Facebook, Twitter, LinkedIn
2. **Enhanced Profile Sync** - Sync more profile data
3. **Account Merging** - Better handling of duplicate accounts
4. **Two-Factor Authentication** - Add 2FA for linked accounts
5. **Social Sharing** - Allow users to share content to social media

## 📚 Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Passport.js Documentation](http://www.passportjs.org/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

**Note**: This implementation is for development purposes. For production use, ensure proper security measures, HTTPS, and environment variable management.

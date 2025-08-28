const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

// Debug logging for OAuth configuration
console.log('=== PASSPORT CONFIGURATION DEBUG ===');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('GITHUB_CLIENT_ID exists:', !!process.env.GITHUB_CLIENT_ID);
console.log('GITHUB_CLIENT_SECRET exists:', !!process.env.GITHUB_CLIENT_SECRET);
console.log('GOOGLE_CLIENT_ID value:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET length:', process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.length : 'undefined');
console.log('=====================================');

// JWT Strategy - only initialize if JWT_SECRET is available
if (process.env.JWT_SECRET) {
  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  }, async (payload, done) => {
    try {
      const user = await User.findById(payload.userId);
      if (user && user.isActive) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  }));
} else {
  console.warn('JWT_SECRET not found. JWT authentication will not work.');
}

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here') {
  console.log('Initializing Google OAuth strategy...');
  passport.use('google', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ 
        'socialLogin.provider': 'google',
        'socialLogin.socialId': profile.id 
      });

      if (!user) {
        // Check if email already exists
        const existingUser = await User.findOne({ email: profile.emails[0].value });
        
        if (existingUser) {
          // Link social account to existing user
          existingUser.socialLogin = {
            provider: 'google',
            socialId: profile.id,
            avatar: profile.photos[0]?.value
          };
          await existingUser.save();
          user = existingUser;
        } else {
          // Create new user
          user = new User({
            username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).substr(2, 5),
            email: profile.emails[0].value,
            socialLogin: {
              provider: 'google',
              socialId: profile.id,
              avatar: profile.photos[0]?.value
            },
            profile: {
              firstName: profile.name.givenName,
              lastName: profile.name.familyName
            }
          });
          await user.save();
        }
      }

      return done(null, user);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
  console.log('Google OAuth strategy initialized successfully');
} else {
  console.warn('Google OAuth credentials not configured. Google login will not work.');
  console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
  console.log('GOOGLE_CLIENT_SECRET length:', process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.length : 'undefined');
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.GITHUB_CLIENT_ID !== 'your_github_client_id_here') {
  console.log('Initializing GitHub OAuth strategy...');
  passport.use('github', new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/auth/github/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ 
        'socialLogin.provider': 'github',
        'socialLogin.socialId': profile.id 
      });

      if (!user) {
        // Check if email already exists
        const existingUser = await User.findOne({ email: profile.emails[0]?.value });
        
        if (existingUser) {
          // Link social account to existing user
          existingUser.socialLogin = {
            provider: 'github',
            socialId: profile.id,
            avatar: profile.photos[0]?.value
          };
          await existingUser.save();
          user = existingUser;
        } else {
          // Create new user
          user = new User({
            username: profile.username + Math.random().toString(36).substr(2, 5),
            email: profile.emails[0]?.value || `${profile.username}@github.com`,
            socialLogin: {
              provider: 'github',
              socialId: profile.id,
              avatar: profile.photos[0]?.value
            },
            profile: {
              firstName: profile.displayName?.split(' ')[0] || profile.username,
              lastName: profile.displayName?.split(' ').slice(1).join(' ') || ''
            }
          });
          await user.save();
        }
      }

      return done(null, user);
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      return done(error, null);
    }
  }));
  console.log('GitHub OAuth strategy initialized successfully');
} else {
  console.warn('GitHub OAuth credentials not configured. GitHub login will not work.');
}

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

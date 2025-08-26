const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

// JWT Strategy
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

// Google OAuth Strategy
passport.use(new GoogleStrategy({
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
    return done(error, null);
  }
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
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
    return done(error, null);
  }
}));

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

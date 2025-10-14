const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

// JWT Strategy
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
}

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here' && 
    process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret_here') {
  
  const callbackURL = process.env.NODE_ENV === 'production' 
    ? 'https://e-store-for-est.onrender.com/api/auth/google/callback'
    : 'http://localhost:5000/api/auth/google/callback';
  
  console.log('Google OAuth Config:', {
    clientID: process.env.GOOGLE_CLIENT_ID,
    callbackURL: callbackURL,
    NODE_ENV: process.env.NODE_ENV
  });
  
  passport.use('google', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth profile received:', {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0]?.value
      });

      // Check if user already exists
      let user = await User.findOne({ 
        'socialLogin.provider': 'google',
        'socialLogin.socialId': profile.id 
      });

      if (!user) {
        // Check if email already exists
        const existingUser = await User.findOne({ email: profile.emails[0].value });
        
        if (existingUser) {
          console.log('Linking social account to existing user');
          // Link social account to existing user
          existingUser.socialLogin = {
            provider: 'google',
            socialId: profile.id,
            avatar: profile.photos[0]?.value
          };
          await existingUser.save();
          user = existingUser;
        } else {
          console.log('Creating new user');
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
          console.log('New user created:', user._id);
        }
      } else {
        console.log('Existing user found:', user._id);
      }

      return done(null, user);
    } catch (error) {
      console.error('Passport strategy error:', error);
      return done(error, null);
    }
  }));
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

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import userModel from '../models/userModel.js';
import 'dotenv/config';

// Configure Google OAuth 2.0 strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/user/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in our database
        let user = await userModel.findOne({ googleId: profile.id });

        if (user) {
          // User exists, check if we need to update profile image
          const profileImage = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

          // Update profile image if it has changed
          if (profileImage && profileImage !== user.profileImage) {
            user.profileImage = profileImage;
            await user.save();
          }

          return done(null, user);
        } else {
          // User doesn't exist, create a new user
          const newUser = new userModel({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            profileImage: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null
          });

          // Save the new user
          user = await newUser.save();
          return done(null, user);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Since we're not using sessions, we don't need serializeUser and deserializeUser
// But we'll include them for completeness
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import userModel from '../models/userModel.js';
import adminModel from '../models/adminModel.js';
import 'dotenv/config';

// Configure Google OAuth 2.0 strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || 'https://eatzone.onrender.com'}/api/user/auth/google/callback`,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const firstLetter = email.charAt(0).toUpperCase();
        const profileImage = `https://ui-avatars.com/api/?name=${firstLetter}&background=random&color=fff&size=256`;

        // First check if user exists by googleId
        let user = await userModel.findOne({ googleId: profile.id });

        if (user) {
          // Update profile image if it has changed
          if (profileImage !== user.profileImage) {
            user.profileImage = profileImage;
            await user.save();
          }
          return done(null, user);
        }

        // If not found by googleId, check if user exists by email
        user = await userModel.findOne({ email: email });

        if (user) {
          // SECURITY: Do not automatically link accounts
          // This prevents account takeover attacks
          return done(new Error(`An account with email ${email} already exists. Please sign in with your existing credentials or contact support to link your Google account.`), null);
        }

        // User doesn't exist at all, create a new user
        const newUser = new userModel({
          name: profile.displayName,
          email: email,
          googleId: profile.id,
          profileImage: profileImage
        });

        // Save the new user
        user = await newUser.save();
        return done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

// Configure Google OAuth 2.0 strategy for Admin
passport.use('google-admin',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || 'https://eatzone.onrender.com'}/api/admin/auth/google/callback`,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const firstLetter = email.charAt(0).toUpperCase();
        const profileImage = `https://ui-avatars.com/api/?name=${firstLetter}&background=random&color=fff&size=256`;

        // First check if admin exists by googleId
        let admin = await adminModel.findOne({ googleId: profile.id });

        if (admin) {
          // Update profile image if it has changed
          if (profileImage !== admin.profileImage) {
            admin.profileImage = profileImage;
            await admin.save();
          }
          return done(null, admin);
        }

        // If not found by googleId, check if admin exists by email
        admin = await adminModel.findOne({ email: email });

        if (admin) {
          // SECURITY: Do not automatically link admin accounts
          // This prevents admin account takeover attacks
          return done(new Error(`An admin account with email ${email} already exists. Please sign in with your existing credentials or contact support to link your Google account.`), null);
        }

        // Admin doesn't exist at all, create a new admin
        const newAdmin = new adminModel({
          name: profile.displayName,
          email: email,
          googleId: profile.id,
          profileImage: profileImage,
          firebaseUID: `google_${profile.id}` // Generate a Firebase UID for Google users
        });

        // Save the new admin
        admin = await newAdmin.save();
        return done(null, admin);
      } catch (error) {
        console.error('Google OAuth admin error:', error);
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


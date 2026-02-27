const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('./models/User');

// Only register Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails[0].value;
                    let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });
                    if (user) {
                        user.googleId = profile.id;
                        if (!user.avatar && profile.photos[0]?.value) user.avatar = profile.photos[0].value;
                        await user.save();
                        return done(null, user);
                    }
                    user = await User.create({
                        name: profile.displayName,
                        email,
                        googleId: profile.id,
                        avatar: profile.photos[0]?.value || '',
                        isVerified: true,
                        role: 'jobseeker',
                    });
                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );
} else {
    console.log('⚠️  Google OAuth not configured — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable');
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;

const passport = require('passport');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
require('dotenv').config();

const GOOGLE_CLIENT_ID = '1035434778130-3tk9pickd4l0cs1758ns3fljbdiubn2b.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    console.log(profile);
    console.log(accessToken);
    console.log(refreshToken);
    return done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
    console.log("serialize");
    console.log(user);
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    console.log("deserialize");
    console.log(user);
    done(null, user);
});
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../models/user');

passport.use(new GoogleStrategy({
        clientID: '746036837762-il7a2vs517taktjs0lb5tb4taj5jdseo.apps.googleusercontent.com',
        clientSecret: '2bmR-I7mYU9rdEt1vtA_zotz',
        callbackURL: "https://db3bc849.ngrok.io/users/login/google/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log('profile', profile);
        return cb(null, profile);
    }
));

module.exports = passport;
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../models/user');

const googleID = '746036837762-il7a2vs517taktjs0lb5tb4taj5jdseo.apps.googleusercontent.com';
const googleSecret = '2bmR-I7mYU9rdEt1vtA_zotz';
const googleCbURL = 'https://db3bc849.ngrok.io/users/login/google/callback';

const googleOptions = {
    clientID: googleID,
    clientSecret: googleSecret,
    callbackURL: googleCbURL
};

const googleCB = (accessToken, refreshToken, profile, cb) => {
    console.log('profile', profile);
    return cb(null, profile);
};

passport.use(new GoogleStrategy(googleOptions, googleCB));

module.exports = passport;
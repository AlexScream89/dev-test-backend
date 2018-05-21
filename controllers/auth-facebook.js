const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');

const fbID = '230048087759993';
const fbSecret = '9ea254a0ae57abc4492c4ddb9aca0ba4';
const fbCbURL = 'https://38a91c55.ngrok.io/users/login/facebook/callback';

const fbOptions = {
    clientID: fbID,
    clientSecret: fbSecret,
    callbackURL: fbCbURL
};

const fbCB = (accessToken, refreshToken, profile, cb) => {
    console.log('profile', profile);
    return cb(null, profile);
};

passport.use(new FacebookStrategy(fbOptions, fbCB));

module.exports = passport;
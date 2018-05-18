const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');

passport.use(new FacebookStrategy({
        clientID: '230048087759993',
        clientSecret: '0f0def5970637976b73ad2f9917fd9a0',
        callbackURL: "https://db3bc849.ngrok.io/users/login/facebook/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log('profile', profile);
        return cb(null, profile);
    }
));

module.exports = passport;
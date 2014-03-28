// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var OAuth2Strategy = require('passport-oauth2').Strategy;
// load up the user model
var User = require('../app/models/user');
var request = require("request");

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, username, password, done) {

        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'local.username' :  username }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                // all is well, return user
                else
                    return done(null, user);
            });
        });

    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, username, password, done) {

        // asynchronous
        process.nextTick(function() {
            // check if the user is already logged ina
            if (!req.user) {
                User.findOne({ 'local.username' :  username }, function(err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                    } else {

                        // create the user
                        var newUser            = new User();
                        newUser.local.username    = username;
                        newUser.local.password = newUser.generateHash(password);

                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            return done(null, newUser);
                        });
                    }

                });
            } else {

                var user            = req.user;
                user.local.username    = username;
                user.local.password = user.generateHash(password);
                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });

            }

        });

    }));

    //Oauth
    OAuth2Strategy.prototype.userProfile = function(token, done) {
      request({ url: "http://api.iiens.eu/users/self?access_token=" + token }, function(err, response, me) {
        if(err) {
          console.log("Error while retrieving personal information: " + err);
        }
        else {
          var me = JSON.parse(me);
          done(err, me);
        }
      });
    }

    passport.use(new OAuth2Strategy({
      authorizationURL: "http://www.iiens.eu/oauth/authorize",
      tokenURL: "http://www.iiens.eu/oauth/token",
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth",
    } ,
    function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      User.findOne({"local.username": profile.username}, function (err, user) {
        console.log(user);
        return done(err, user);
      });
    }));


};

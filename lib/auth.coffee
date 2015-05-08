passport = require 'passport'
localStrategy = require('passport-local').Strategy
models = require('../lib/db').models
{User} = models

# initialize passport strategy
exports.init = ->
    passport.serializeUser  (user, done) ->
        done null, user._id
    passport.deserializeUser (id, done) ->
        User.findById id, (err, user) ->
            done(err, user)
# Define auth strategy
passport.use 'auth', new localStrategy
# redefine usernameField for our login form
    usernameField: 'login'
    , (login, password, done) ->
        #console.log 'Enter passport.localStrategy'
        # Call auth function
        User.authenticate login, password, done
        #console.log 'auth completed'

# middleware check if user logged in
module.exports.auth = (req, res, next) ->
    if req.user
        next()
    # if not, redirect to login page
    else res.redirect '/login'
module.exports.auth401 = (req, res, next) ->
    if req.user
        next()
# if not, redirect to login page
    else res.sendStatus 401
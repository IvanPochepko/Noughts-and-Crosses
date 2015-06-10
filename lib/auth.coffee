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
    # redefine usernameField
    usernameField: 'login'
    , (login, password, done) ->
        # Call auth function
        User.authenticate login, password, done

# AUTH check middleware
module.exports.auth = (req, res, next) ->
    return res.redirect '/login' unless req.user
    next()
module.exports.auth401 = (req, res, next) ->
    return res.sendStatus 401 unless req.user
    next()

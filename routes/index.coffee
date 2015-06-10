express = require 'express'
passport = require 'passport'
router = express.Router()
{User, Game} = require('../lib/db').models
auth = require '../lib/auth'

# templates route
router.get '/partials/:template', (req, res) ->
    template = req.params.template
    res.render 'partials/' + template
# GET home page. #
router.get '/', auth.auth, (req, res, next) ->
    res.render 'index',
        title: 'Appchestra Games'

router.get '/registration', (req, res) ->
    res.render 'registration',
        title: 'Registration page'
router.get '/login', (req, res, next) ->
    res.render 'login',
        title: 'Login page'
router.post '/registration', (req, res) ->
    login= req.body.login
    password = req.body.password
    if (not login || not password)
        res.status(400).send 'Bad data, sorry!'
        return false
    User.register req.body, (err, doc) ->
        res.redirect '/login'

router.post '/auth',
    passport.authenticate 'auth',
        successRedirect: '/'
        failureRedirect: '/login'

router.get '/logout', auth.auth, (req, res) ->
    req.logout()
    res.redirect '/login'
module.exports = router;

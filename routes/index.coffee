express = require 'express'
passport = require 'passport'
router = express.Router()
{User, Game} = require('../lib/db').models
auth = require '../lib/auth'

# GET home page. #
router.get '/', auth.auth, (req, res, next) ->
# get other users list
    User.find
        _id:
            $ne: req.user._id.toString()
    , (err, gamers) ->
        Game.find(status: $ne: 'completed')
        .populate('player1 player2')
        .exec (err, games)->
            #console.log 'Games with not "completed" status: ', games
            res.render 'index',
                title: 'Main Page'
                user: req.user
                gamers: gamers
                oldGames: games

router.get '/registration', (req, res) ->
    res.render 'registration',
        title: 'Registration page'
router.get '/login', (req, res, next) ->
    res.render 'login',
        title: 'Login page'
router.post '/registration', (req, res) ->
    login= req.body.login
    password = req.body.password
    #console.log 'login: ', login, 'password: ', password
    if(not login || not password)
        console.log 'Empty data!'
        res.status(400).send 'What a Shit!'
        return false
    User.register req.body, (err, doc) ->
        res.send doc

router.post '/auth',
    passport.authenticate 'auth',
        successRedirect: '/'
        failureRedirect: '/login'

module.exports = router;

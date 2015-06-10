express = require 'express'
router = express.Router()
async = require 'async'

{User, Game} = require('../lib/db').models
auth = require '../lib/auth'

# GET users listing. #
router.get '/vcard', (req, res) ->
    # load user
    loadUser = (cb) ->
        User.findById req.user._id.toString(), (err, user) ->
            cb err, user
    # find user games
    loadGames = (cb) ->
        Game.find({$or: [{player1: req.user._id}, {player2: req.user._id}]})
        .populate('player1 player2', 'login')
        .exec (err, games) ->
            cb err, games
    # find all users
    loadUserList = (cb) ->
        User.find {_id: $ne: req.user._id.toString()}, 'login', (err, users) ->
            cb err, users
    async.series [
        loadUser,
        loadGames,
        loadUserList
    ], (err, [user, games, users]) ->
        return res.sendStatus 500 if err
        res.send {user, games, users}

module.exports = router

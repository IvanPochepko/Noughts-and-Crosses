express = require 'express'
router = express.Router()
_ = require 'underscore'

{User, Game, ChatMessage} = require('../lib/db').models
auth = require '../lib/auth'
getIo = require('../lib/socket').getIo

router.post '/create', auth.auth, (req, res, next) ->
    Game.create
        player1: req.user._id
        player2: req.body.player2
        status: 'started'
    , (err, game) ->
        res.send game

router.get '/:id', auth.auth, (req, res) ->
    res.render 'index',
        title: 'Appchestra Games'

router.get '/:id/json', auth.auth, (req, res) ->
    id = req.params.id
    Game.findById id
    .populate('player1 player2 winner', 'login')
    .populate('chat')
    .exec (err, game)->
        game.populate {path: 'chat.user', model: 'User', select: 'login'}, (err, game) ->
            winner = game.winner
            lastMove = _.last game.turns
            firstPlayerMove = not lastMove || lastMove.type == 'nought'
            yourTurn = firstPlayerMove && req.user._id.toString() == game.player1._id.toString() ||
            not firstPlayerMove && req.user._id.toString() == game.player2._id.toString()
            user = _.clone req.user
            user.setValue 'password', "You'll not see it"
            res.send
                game: game
                user: user
                yourTurn: yourTurn
                winner: winner

router.post '/:id/addmessage', auth.auth401, (req, res) ->
    io = getIo()
    _id = req.params.id
    text = req.body.message
    ChatMessage.create
        user: req.user._id,
        text: text
    , (err, message) ->
        Game.update {_id}, {$push: chat: message._id}, (err) ->
            message.user = req.user
            res.sendStatus 200
            io.in(_id).emit 'chatMessage', message

router.post '/:id/addturn', (req, res) ->
    io = getIo()
    id = req.params.id
    figure = req.body
    Game.findById id
    .populate('player1 player2')
    .exec (err, game) ->
        if game.status == 'completed'
            return res.send 'Game is over'
        lastMove = _.last(game.turns);
        firstPlayerMove = !lastMove || lastMove.type == 'nought';
        userRole = firstPlayerMove && req.user._id.toString() == game.player1._id.toString() && 'cross' ||
        not firstPlayerMove && req.user._id.toString() == game.player2._id.toString() && 'nought' || false;
        if not userRole
            return res.send error: 'Not your turn'
        figure.type = userRole
        game.turns.push figure
        game.markModified 'turns'
        winner = checkWin(game)
        game.save (err) ->
            res.sendStatus 200
            io.in(id).emit 'gameTurn',
                turn: figure
                whoseTurn: firstPlayerMove and 'player2' or 'player1'
                winner: game.winner

checkWin = (game) ->
    winner = null
    winCombo =
        [[1,2,3]
        [1,4,7]
        [1,5,9]
        [4,5,6]
        [2,5,8]
        [3,5,7]
        [7,8,9]
        [3,6,9]]
    winCross = false
    winNought = false
    group = _.groupBy(game.turns, 'type'); # sorting all turns by figure type
    #get ids of crosses and convert it to Int
    cross_ids = _.pluck(group.cross, 'id').map (x) ->
        return parseInt x
    #get ids of noughts and convert it to Int
    nought_ids = _.pluck(group.nought, 'id').map (x) ->
        return parseInt x
    winCombo.forEach (combo)->
        if(winCross || winNought)
            return
        winCross = cross_ids.indexOf(combo[0]) isnt -1 && cross_ids.indexOf(combo[1]) isnt -1 && cross_ids.indexOf(combo[2]) isnt -1
        winNought = nought_ids.indexOf(combo[0]) isnt -1 && nought_ids.indexOf(combo[1]) isnt -1 && nought_ids.indexOf(combo[2]) isnt -1
    if winCross
        winner = game.player1
        game.status = 'completed';
        game.winner = winner
    if winNought
        winner = game.player2
        game.status = 'completed'
        game.winner = winner
    if game.turns.length == 9 && not winCross && not winNought
        winner = login: 'draw'
        game.status = 'completed'

module.exports = router

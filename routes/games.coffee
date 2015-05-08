express = require 'express'
router = express.Router()
{User, Game, ChatMessage} = require('../lib/db').models
auth = require '../lib/auth'
_ = require 'underscore'
getIo = require('../lib/socket').getIo

router.get '/create', auth.auth, (req, res, next) ->
    #console.log 'Create game, req: ', req
    Game.create
        player1: req.user._id
        player2: req.query.player
        status: 'started', (err, game) ->
            #console.log('Game id:', game, '\nreq.user: ', req.user);
            res.redirect '/games/'+ game._id

router.get '/:id', auth.auth, (req, res) ->
    id = req.params.id
    User.find
        _id:
            $ne:req.user._id
    , (err, gamers) ->
        Game.findById(id)
        .populate('player1 player2', 'login')
        .populate('chat')
        .exec (err, game) ->
            game.populate {path: 'chat.user', model: 'User'}, (err, game) ->
                console.log 'Created game: ', game
                res.render 'games',
                    title: 'Main Page'
                    user: req.user
                    gamers: gamers
                    game: game
                    winner: ''

router.get '/:id/json', auth.auth, (req, res) ->
    id = req.params.id
    Game.findById id
    .populate('player1 player2 winner', 'login')
    .exec (err, game)->
        console.log 'Created game: ', game
        winner = game.winner
        console.log 'Winner: ', winner
        lastMove = _.last game.turns
        firstPlayerMove = not lastMove || lastMove.type == 'nought'
        console.log req.user._id, game.player1._id.toString(), typeof req.user._id
        yourTurn = firstPlayerMove && req.user._id.toString() == game.player1._id.toString() ||
        not firstPlayerMove && req.user._id.toString() == game.player2._id.toString()
        res.send
            game: game
            user: req.user
            yourTurn: yourTurn
            winner: winner

router.post '/:id/addmessage', auth.auth401, (req, res) ->
    io = getIo()
    _id = req.params.id
    console.log 'Addmessage section, gameID: ', _id
    text = req.body.message
    console.log 'message: ', text
    ChatMessage.create
        user: req.user._id,
        text: text
    , (err, message) ->
        console.log 'enter message creation section'
        Game.update {_id}, {$push: chat: message._id}, (err) ->
            message.user = req.user
            res.sendStatus 200
            io.in(_id).emit 'chatMessage', message


router.get '/:id/latestturns', auth.auth401, (req, res) ->
    id = req.params.id
    lastTurn = req.query
    #console.log 'Last turn: ', lastTurn
    Game.findById id
    .populate('player1 player2', 'login')
    .exec (err, game) ->
        found = not lastTurn.id
        #console.log 'found= ', found
        gameTurns = game.turns
        latestTurns = gameTurns.filter (turn) ->
            result = found
            #console.log 'turn.id = ', turn.id, 'lastTurn.id = ', lastTurn.id, 'result: ', result
            if turn.id == lastTurn.id
                found = true
            return result
        #console.log 'latest turns ', latestTurns
        lastMove = _.last game.turns
        firstPlayerMove = not lastMove || lastMove.type == 'nought'
        yourTurn = firstPlayerMove && req.user._id.toString() == game.player1._id.toString() ||
        not firstPlayerMove && req.user._id.toString() == game.player2._id.toString();
        res.send
            latestTurns: latestTurns
            yourTurn: yourTurn
            winner: game.winner

router.get '/:id/addturn', (req, res) ->
    io = getIo()
    id = req.params.id
    figure = req.query
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
            #console.log("ERROR", err)
            #console.log('var winner: ', game.winner)
            res.sendStatus 200
            gameTurns = game.turns
            latestTurns = gameTurns.filter (turn) ->
                result = found
                if turn.id == figure.id
                    found = true
                return result
            io.in(id).emit 'gameTurn',
                turn: figure
                whoseTurn: firstPlayerMove and 'player2' or 'player1'
                winner: game.winner

checkWin = (game) ->
    winner = null
    #console.log 'Enter win combo checking...'
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
    #console.log('winCombo: ', winCombo, 'win: ', win);
    group = _.groupBy(game.turns, 'type'); # sorting all turns by figure type
    #console.log(group);
    #get ids of crosses and convert it to Int
    cross_ids = _.pluck(group.cross, 'id').map (x) ->
        return parseInt x
    #console.log('Cross ids: ', cross_ids);
    #get ids of noughts and convert it to Int
    nought_ids = _.pluck(group.nought, 'id').map (x) ->
        return parseInt x
    #console.log('Nought ids: ', nought_ids);
    winCombo.forEach (combo)->
        #console.log('enter winCombo forEach function');
        if(winCross || winNought)
            return
        winCross = cross_ids.indexOf(combo[0]) isnt -1 && cross_ids.indexOf(combo[1]) isnt -1 && cross_ids.indexOf(combo[2]) isnt -1
        winNought = nought_ids.indexOf(combo[0]) isnt -1 && nought_ids.indexOf(combo[1]) isnt -1 && nought_ids.indexOf(combo[2]) isnt -1
    #console.log('Crosses forEach combo: ', winCross);
    #console.log('Noughts forEach combo: ', winNought);
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
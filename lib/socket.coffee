socketio = require('socket.io')
io = false
exports.boot = (server) ->
    io = socketio server

    io.on 'connection', (socket) ->
        console.log 'socket connected'
        socket.on 'subscribe', (data) ->
            console.log 'subscription request', data
            socket.join data.game

exports.getIo = () -> io
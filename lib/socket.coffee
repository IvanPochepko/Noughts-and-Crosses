socketio = require('socket.io')
io = false
exports.boot = (server) ->
    io = socketio server

    io.on 'connection', (socket) ->
        socket.on 'subscribe', (data) ->
            socket.join data.game

exports.getIo = () -> io

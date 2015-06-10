# author Andrew Safonov (e-mail: safonovandrew@gmail.com)
express = require 'express'
path = require 'path'
favicon = require 'serve-favicon'
logger = require 'morgan'
cookieParser = require 'cookie-parser'
bodyParser = require 'body-parser'
passport = require 'passport'
expressSession = require 'express-session'
http = require 'http'
socket = require './lib/socket'
RedisStore = require('connect-redis')(expressSession);

db = require './lib/db'
require('./lib/auth').init()

app = express()

normalizePort = (val) ->
    port = parseInt val, 10
    if isNaN port
# named pipe
        return val
    if port >= 0
# port number
        return port
    return false

port = normalizePort process.env.PORT || '3000'
app.set 'port', port

#view engine setup
app.set 'views', path.join __dirname, 'views'
app.set 'view engine', 'jade'
db.initialize()

app.use logger('dev')
app.use bodyParser.json()
app.use bodyParser.urlencoded
    extended: false
app.use cookieParser()
app.use express.static path.join __dirname, 'public'
app.use expressSession
    store: new RedisStore()
    secret: 'iLLs3mv8EFi77oejJBn3f'
    cookie:
        maxAge: 30*24*60*60*1000
app.use passport.initialize()
app.use passport.session()

app.use '/', require './routes/index'
app.use '/users', require './routes/users'
app.use '/games', require './routes/games'

app.use (req, res, next) ->
    err = new Error 'Not Found'
    err.status = 404;
    next err

# error handlers

# development error handler
# will print stacktrace
if app.get('env') == 'development'
    app.use (err, req, res, next) ->
        res.status err.status || 500
        res.render 'error',
            message: err.message
            error: err

# production error handler
# no stacktraces leaked to user
app.use (err, req, res, next)->
    res.status err.status || 500
    res.render 'error',
        message: err.message
        error: {}
server = http.createServer app
socket.boot server
server.listen port

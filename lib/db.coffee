mongoose = require 'mongoose'
User = require './models/user'
Game = require './models/game'
ChatMessage = require './models/message'

module.exports.initialize = ->
    mongoose.connect 'mongodb://localhost/games'

module.exports.models = {User, Game, ChatMessage}
mongoose = require 'mongoose'
ObjectId = mongoose.Schema.Types.ObjectId
schema = mongoose.Schema
    created:
        type: Date, default: Date.now
    status:
        type: String, default: "new"
    player1:
        type: ObjectId, ref: 'User'
    player2:
        type: ObjectId, ref: 'User'
    winner:
        type: ObjectId, ref: 'User'
    turns: []
    chat:
        [type: ObjectId, ref: 'ChatMessage']

Model = mongoose.model 'Game', schema

module.exports = Model

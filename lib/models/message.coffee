mongoose = require 'mongoose'
ObjectId = mongoose.Schema.Types.ObjectId
schema = mongoose.Schema
    date:
        type:Date, default: Date.now
    user:
        type: ObjectId, ref: 'User'
    text: String

Model = mongoose.model 'ChatMessage', schema

module.exports = Model
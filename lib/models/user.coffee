mongoose = require 'mongoose'
crypto = require 'crypto'

schema = mongoose.Schema
    login: {type: String, default: 'Guest'}
    password: String
    created: {type: Date, default: Date.now}

Model = mongoose.model 'User', schema

Model.register = (user, cb) ->
    # Find if user already registered on server
    Model.findOne login: user.login, 'login', (err, existing_user) ->
        return cb new Error('User already registered') if existing_user
        user.password = hashPassword(user.password)
        Model.create user, (err, user) ->
            cb && cb err, user

# Define authenticate method
Model.authenticate = (user, pass, cb) ->
    # search user in db. In {login: user} put login key from User model(see upper)
    Model.findOne {login: user}, (err, user) ->
        return cb(err) if err
        return cb null, false unless user
        # check password
        return cb null, false if user.password isnt hashPassword pass
        # authenticated successfully
        cb null, user

# Hash the password
hashPassword = (password) ->
    passwordHash = crypto.createHash('md5').update(password).digest 'base64'
    return passwordHash

module.exports = Model

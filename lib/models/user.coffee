mongoose = require 'mongoose'
crypto = require 'crypto'
schema = mongoose.Schema
    login:
        type: String, default: 'Guest'
    password: String
    created:
        type: Date, default: Date.now

Model = mongoose.model 'User', schema

Model.register = (user, cb) ->
    # Find if user already registered on server
    Model.findOne login: user.login, 'login', (err, existing_user) ->
        console.log existing_user
        if existing_user
            return cb 'User already registered'
        user.password = hashPassword(user.password)
        Model.create user, (err, user) ->
            cb && cb err, 'Welcome, '+user.login

# Define authenticate method
Model.authenticate = (user, pass, cb) ->
    console.log 'enter user authenticate'
# search user in db. In {login: user} put login key from User model(see upper)
    Model.findOne login: user, (err, user) ->
        console.log 'login: ', user
        if err
            return cb(err);
        if not user
            console.log 'User Not Found with username '+user
            return cb null, false
        # Checking is enter password valid
        if user.password isnt hashPassword pass
            return cb null, false
        # If user login and password true
        return cb null, user

# Hash the password for database
hashPassword = (password) ->
    passwordHash = crypto.createHash('md5').update(password).digest 'base64'
    return passwordHash

module.exports = Model
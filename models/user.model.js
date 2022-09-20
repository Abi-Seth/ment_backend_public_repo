const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { AUTH_SECRET, APP_DOMAIN } = require('../constants/index.constants');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minLength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minLength: 5
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    profilePicture: {
        type: String,
        default: `${APP_DOMAIN}public/users/defaultAvatar.png`
    },
    workspaces: {
        type: Array
    },
    verified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    }
}, { timestamps: true });

userSchema.methods.generateAuthToken = function(rememberStatus) {
    let expiry;
    if (rememberStatus) {
        expiry = '365d';
    } else {
        expiry = '2d';
    }

    const token = jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email,
        profilePicture: this.profilePicture,
        workspaces: this.workspaces
    }, AUTH_SECRET, { expiresIn: expiry })
    return token;
}

userSchema.methods.generateVerificationToken = function(user) {
    const ver_token = jwt.sign({
        username: user.username,
        email: user.email,
        randomId: user.radId
    }, AUTH_SECRET, { expiresIn: '2d' })
    return ver_token;
}

const User = mongoose.model('User', userSchema);

exports.User = User;
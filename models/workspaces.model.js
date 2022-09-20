const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { AUTH_SECRET } = require('../constants/index.constants');

const workspaceSchema = new mongoose.Schema({
    workspaceName: {
        type: String,
        required: true,
        unique: true,
        minLength: 1
    },
    workspaceDescription: {
        type: String,
        required: true
    },
    workspaceAdmins: {
        type: Array,
        required: true
    },
    workspaceLogo: {
        type: String
    },
    workspacePendingInvites: {
        type: Array
    },
    workspaceMembers: {
        type: Array,
        required: true
    },
    workspaceType: {
        type: String,
        enum: ['private', 'public']
    }
}, { timestamps: true });

workspaceSchema.methods.generateInvitationToken = function(user) {
    const invite_token = jwt.sign({
        username: user.username,
        email: user.email,
        id: user._id,
        workspaceId: this._id
    }, AUTH_SECRET, { expiresIn: '365d' })
    return invite_token;
}

const Workspace = mongoose.model('Workspace', workspaceSchema);

exports.Workspace = Workspace;
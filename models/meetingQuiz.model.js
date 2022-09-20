const mongoose = require('mongoose');

const meetingQuizSchema = new mongoose.Schema({
    quizName: {
        type: String,
        required: true,
        minLength: 1
    },
    quizDescription: {
        type: String,
        required: true,
        minLength: 1
    },
    quizQuestions: {
        type: Array,
    },
    quizAdmin: {
        type: String,
        required: true
    },
    quizMembers: {
        type: Array,
        required: true
    },
    quizStatus: {
        type: String,
        enum: ['opened', 'closed'],
        default: 'closed'
    },
    quizShowType: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    startDate: {
        type: String,
        required: true
    },
    workspaceId: {
        type: String,
        required: true
    },
    failedQuestions: {
        type: Number,
        default: 0
    },
    passedQuestions: {
        type: Number,
        default: 0
    },
    quizTo: {
        type: String,
        required: true
    },
    firedAskers: {
        type: Array
    },
    chargedAmount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Meetingquiz = mongoose.model('Meetingquiz', meetingQuizSchema);

exports.Meetingquiz = Meetingquiz;
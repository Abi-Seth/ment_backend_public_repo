const _ = require('lodash');
const { User } = require('../models/user.model');
const { Workspace } = require('../models/workspaces.model');
const { Meetingquiz } = require('../models/meetingQuiz.model');
const { APP_FRONTEND_DOMAIN } = require('../constants/index.constants');
const { 
    validateQuizRegisteration,
    validateQuizInvitation,
    validateQuizQuestion
} = require('../validators/meetingQuiz..validator');
const { sendEmail } = require('../utils/sendEmails');
const { v4 } = require('uuid');
const { tokenMatcher } = require('../middlewares/tokenMatcher.middleware');

exports.addQuiz = async (req, res) => {
    try {
        const userId = req.params.userId;
        const workspaceId = req.params.workspaceId;
        await tokenMatcher(req, res, userId);
        
        let user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'User not found!'               
            })
        }

        let workspace = await Workspace.findById(workspaceId);
        
        if (!workspace) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'Workspace not found!'               
            })
        }

        const quiz = req.body;

        const validateQuizInput = validateQuizRegisteration(quiz);

        if (validateQuizInput.error) {
            return res.status(400).send(validateQuizInput.error.details[0].message);
        }

        let quizmebers = [];

        for(let i = 0; i < workspace.workspaceMembers.length; i++) {
            const member = await User.findById(workspace.workspaceMembers[i]);
            quizmebers.push(member.username);
        }

        let quizData = {
            quizName: quiz.quizName,
            quizDescription: quiz.quizDescription,
            quizQuestions: [],
            quizAdmin: userId,
            quizMembers: [...quizmebers, user.username],
            quizStatus: 'closed',
            quizShowType: 'public',
            startDate: quiz.startDate,
            workspaceId: workspaceId,
            quizTo: quiz.quizTo
        }

        let quizto = await User.findOne({ username: quiz.quizTo});
        
        if (!quizto) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'Person to be asked not found!'               
            })
        }

        let member;
        for (let i = 0; i < quizData.quizMembers.length; i++) {
            member = await User.findOne({ username:  quizData.quizMembers[i]});
            if (!workspace.workspaceMembers.includes(member._id))
                quizData.quizMembers.splice(i, 0);

            if (member && member.username != user.username && workspace.workspaceMembers.includes(member._id) && quizData.quizTo != member.username) {
                const subject = `Ment: Invitation to a meeting quiz ${quizData.quizName}.` 
                const html = `
                    <p style="font-family: Poppins">Hello ${member.username},</p>
                    <h2 style="font-family: Poppins">New great day again 🔥. ${quizData.quizTo} is gonna answer every question here. 🔥🔥🔥</h2>
                    <p style="font-family: Poppins">${user.username} has invited to a quiz meeting ${quizData.quizName} taking place on ${quizData.startDate}.</p>
                    <p style="font-family: Poppins">You and your hummies can now still rock 🔥 right!</p>
                    <br>
                    <a style="padding: 0.9em 2em; background: #FF3834; font-family: Poppins !important; border-radius: 0.3em; color: white; font-size: 0.88em; text-decoration: none; margin: 2em 0;" target="_blank" href='${APP_FRONTEND_DOMAIN}app'>Check on my hummies</a>
                    <br>
                `;
                await sendEmail(member.email, subject, html);
            }
        }

        const newQuiz = new Meetingquiz(_.pick(quizData, ['quizName', 'quizDescription', 'quizQuestions', 'quizAdmin', 'quizMembers', 'quizStatus', 'quizShowType', 'startDate', 'workspaceId', 'quizTo']));

        await newQuiz.save()
            .then(() => {

                res.status(201).send({
                    success: true,
                    status: 201,
                    message: 'Quiz meeting created successfully.',
                    data: newQuiz
                })

            }).catch((err) => {
                res.status(400).send({
                    success: false,
                    status: 400,
                    message: err.message
                })
            })

    } catch(err) {
        res.status(400).send({
            success: false,
            status: 400,
            message: err.message
        })
    }
}

exports.inviteMember = async (req, res) => {
    try {
        const userId = req.params.userId;
        const invitedId = req.params.invitedId;
        const quizId = req.params.quizId;
        await tokenMatcher(req, res, userId);

        let user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'User not found!'               
            })
        }

        let invitedUser = await User.findById(invitedId);
        
        if (!invitedUser) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'Invited user not found!'               
            })
        }

        let quiz = await Meetingquiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'Quiz not found!'               
            })
        }

        if (user._id != quiz.quizAdmin) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'You are not an admin to add a member!'               
            })
        }

        const validateQuizInput = validateQuizInvitation(req.body);

        if (validateQuizInput.error) {
            return res.status(400).send(validateQuizInput.error.details[0].message);
        }

        let member;
        for (let i = 0; i < req.body.quizMembers.length; i++) {
            member = await User.findOne({ username:  req.body.quizMembers[i]});

            if (member && member.username != user.username && workspace.workspaceMembers.includes(member._id)) {
                const subject = `Ment: Invitation to a meeting quiz ${quizData.quizName}.` 
                const html = `
                    <p style="font-family: Poppins">Hello ${member.username},</p>
                    <h2 style="font-family: Poppins">New great day again 🔥.</h2>
                    <p style="font-family: Poppins">${user.username} has invited to a quiz meeting ${quizData.quizName} taking place on ${quizData.startDate}.</p>
                    <p style="font-family: Poppins">You and your hummies can now still rock 🔥 right!</p>
                    <br>
                    <a style="padding: 0.9em 2em; background: #FF3834; font-family: Poppins !important; border-radius: 0.3em; color: white; font-size: 0.88em; text-decoration: none; margin: 2em 0;" target="_blank" href='${APP_FRONTEND_DOMAIN}app'>Check on my hummies</a>
                    <br>
                `;
                await sendEmail(member.email, subject, html);

                quiz.quizMembers = [...quizMembers, member.username];
            }
        }

        await quiz.save()
            .then(() => {

                res.status(201).send({
                    success: true,
                    status: 201,
                    message: 'Quiz members added.',
                    data: newQuiz
                })

            }).catch((err) => {
                res.status(400).send({
                    success: false,
                    status: 400,
                    message: err.message
                })
            })

    } catch(err) {
        res.status(400).send({
            success: false,
            status: 400,
            message: err.message
        })
    }
}

exports.changeStatus = async (req, res) => {
    try {
        const userId = req.params.userId;
        const quizId = req.params.quizId;
        await tokenMatcher(req, res, userId);

        let user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'User not found!'               
            })
        }

        let quiz = await Meetingquiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'Quiz not found!'               
            })
        }

        if (user._id != quiz.quizAdmin) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'Only admins can start or stop a meeting!'               
            })
        }

        if (quiz.quizStatus == 'opened') {
            quiz.quizStatus = 'closed';
        } else {
            quiz.quizStatus = 'opened';
        }

        const quizto = await User.findOne({ username: quiz.quizTo });

        if (!quizto) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'User not found!'               
            })
        }

        await quiz.save()
            .then(() => {

                if (quiz.quizStatus == 'closed') {
                    const subject = `Ment: ${quiz.quizName} performance.` 
                    const html = `
                        <p style="font-family: Poppins">Hello ${quizto.username},</p>
                        <h2 style="font-family: Poppins">You have completed your quiz 🔥🔥🔥</h2>
                        <p style="font-family: Poppins">After a careful analysis your hommies think you have performed the below grades.</p>
                        <br>
                        <h1 style="font-family: Poppins"><span style="color: green">Passed: ${quiz.passedQuestions}, <span style="color: red">Failed: ${quiz.failedQuestions}</span></h1>
                        <br>
                        <h1 style="font-family: Poppins; color: dodgerblue">Amount to pay: ${quiz.chargedAmount} RWF</h1>
                        <br>
                        <p style="font-family: Poppins">You and your hummies can now still rock 🔥 right!</p>
                        <br>
                        <a style="padding: 0.9em 2em; background: #FF3834; font-family: Poppins !important; border-radius: 0.3em; color: white; font-size: 0.88em; text-decoration: none; margin: 2em 0;" target="_blank" href='${APP_FRONTEND_DOMAIN}app'>Check on my hummies</a>
                        <br>
                    `;
                    sendEmail(quizto.email, subject, html);
                }

                if (quiz.firedAskers.length > 0) {
                    for (let i = 0; i < quiz.firedAskers.length; i++) {
                        const foolasker = User.findOne({ username: quiz.firedAskers[i].asker });
                        const subject = `Ment: 😭 You disappointed us at ${quiz.quizName} event. 😭` 
                        const html = `
                            <p style="font-family: Poppins">Hello ${quiz.firedAskers[i].asker},</p>
                            <h2 style="font-family: Poppins">The event was great 🔥🔥🔥 but you made us 😭</h2>
                            <p style="font-family: Poppins">After a careful analysis 🤔 your hommies think you have asked a foolish question 🤔. Why 🤦🤦🤦🤦</p>
                            <br>
                            <h1 style="font-family: Poppins"><span style="color: red">You will pay: 100 RWF</span></h1>
                            <br>
                            <p style="font-family: Poppins">You and your hummies can now still rock 🔥 right!</p>
                            <br>
                            <a style="padding: 0.9em 2em; background: #FF3834; font-family: Poppins !important; border-radius: 0.3em; color: white; font-size: 0.88em; text-decoration: none; margin: 2em 0;" target="_blank" href='${APP_FRONTEND_DOMAIN}app'>Check on my hummies</a>
                            <br>
                        `;
                        sendEmail(foolasker.email, subject, html);
                    }
                }

                res.status(201).send({
                    success: true,
                    status: 201,
                    message: 'Quiz status changed.',
                    data: quiz
                })

            }).catch((err) => {
                res.status(400).send({
                    success: false,
                    status: 400,
                    message: err.message
                })
            })

    } catch(err) {
        res.status(400).send({
            success: false,
            status: 400,
            message: err.message
        })
    }
}

exports.addQuestion = async (req, res) => {
    try {
        const userId = req.params.userId;
        const quizId = req.params.quizId;
        await tokenMatcher(req, res, userId);
        
        let user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'User not found!'               
            })
        }

        let quiz = await Meetingquiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'Quiz not found!'               
            })
        }

        if (!quiz.quizMembers.includes(user.username)) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'You are not invited to this quiz!'               
            })
        }

        if (quiz.quizQuestions.length >= 7) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'Question limit is already reached!'               
            })
        }

        if (quiz.quizStatus == 'closed') {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'Meeting not yet started!'               
            })
        }

        if (quiz.quizTo == user.username) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'You cannot ask yourself!'               
            })
        }

        const validateQuizInput = validateQuizQuestion(req.body);

        if (validateQuizInput.error) {
            return res.status(400).send(validateQuizInput.error.details[0].message);
        }

        quiz.quizQuestions = [...quiz.quizQuestions, {
            _id: v4(),
            asker: user._id,
            question: req.body.quizQuestion,
            answered: false,
            failedToAnswer: false
        }];

        await quiz.save()
            .then(() => {

                res.status(201).send({
                    success: true,
                    status: 201,
                    message: 'Quiz question sent.',
                    data: quiz
                })

            }).catch((err) => {
                res.status(400).send({
                    success: false,
                    status: 400,
                    message: err.message
                })
            })

    } catch(err) {
        res.status(400).send({
            success: false,
            status: 400,
            message: err.message
        })
    }
}

exports.failedQuestion = async (req, res) => {
    try {
        const userId = req.params.userId;
        const quizId = req.params.quizId;
        const qnId = req.params.questionId;
        const amount = req.body.amount;
        await tokenMatcher(req, res, userId);

        if (!amount) {
            return res.status(400).send({
                success: false,
                status: 400,
                message: 'Amount should be specified!'               
            })
        }
        
        let user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'User not found!'               
            })
        }

        let quiz = await Meetingquiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'Quiz not found!'               
            })
        }

        if (!quiz.quizMembers.includes(user.username)) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'You are not invited to this quiz!'               
            })
        }

        if (quiz.quizStatus == 'closed') {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'Meeting not yet started!'               
            })
        }

        if (quiz.quizTo == user.username) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'You cannot mark yourself!'               
            })
        }

        if (quiz.quizAdmin != user._id) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'Only meeting admin can mark!'               
            })
        }

        for (let i = 0; i < quiz.quizQuestions.length; i++) {
            if (quiz.quizQuestions[i]._id == qnId && quiz.quizQuestions[i].failedToAnswer == false) {
                quiz.quizQuestions[i].failedToAnswer = true;
                quiz.quizQuestions[i].answered = true;
                quiz.failedQuestions = quiz.failedQuestions+1;
                quiz.chargedAmount = quiz.chargedAmount+amount;
                break;
            }

            if ((quiz.quizQuestions.length-1) == i) {
                return res.status(404).send({
                    success: false,
                    status: 404,
                    message: 'Cannot found question!'               
                })
            }
        }

        await Meetingquiz.findOneAndUpdate({ _id: quiz._id }, quiz, { new: true })
            .then(() => {

                res.status(200).send({
                    success: true,
                    status: 200,
                    message: 'Quiz failed.',
                    data: quiz
                })

            }).catch((err) => {
                res.status(400).send({
                    success: false,
                    status: 400,
                    message: err.message
                })
            })

    } catch(err) {
        res.status(400).send({
            success: false,
            status: 400,
            message: err.message
        })
    }
}

exports.passedQuestion = async (req, res) => {
    try {
        const userId = req.params.userId;
        const quizId = req.params.quizId;
        const qnId = req.params.questionId;
        await tokenMatcher(req, res, userId);

        let user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'User not found!'               
            })
        }

        let quiz = await Meetingquiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'Quiz not found!'               
            })
        }

        if (!quiz.quizMembers.includes(user.username)) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'You are not invited to this quiz!'               
            })
        }

        if (quiz.quizStatus == 'closed') {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'Meeting not yet started!'               
            })
        }

        if (quiz.quizTo == user.username) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'You cannot mark yourself!'               
            })
        }

        if (quiz.quizAdmin != user._id) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'Only meeting admin can mark!'               
            })
        }

        for (let i = 0; i < quiz.quizQuestions.length; i++) {
            if (quiz.quizQuestions[i]._id == qnId && quiz.quizQuestions[i].failedToAnswer == false) {
                quiz.passedQuestions = quiz.passedQuestions+1;
                quiz.quizQuestions[i].answered = true;
                break;
            }

            if ((quiz.quizQuestions.length-1) == i) {
                return res.status(404).send({
                    success: false,
                    status: 404,
                    message: 'Cannot found question!'               
                })
            }
        }

        await Meetingquiz.findOneAndUpdate({ _id: quiz._id }, quiz, { new: true })
            .then(() => {

                res.status(200).send({
                    success: true,
                    status: 200,
                    message: 'Quiz passed.',
                    data: quiz
                })

            }).catch((err) => {
                res.status(400).send({
                    success: false,
                    status: 400,
                    message: err.message
                })
            })

    } catch(err) {
        res.status(400).send({
            success: false,
            status: 400,
            message: err.message
        })
    }
}

exports.fireAsker = async (req, res) => {
    try {
        const userName = req.params.userName;
        const userId = req.params.userId;
        const quizId = req.params.quizId;
        const qnId = req.params.questionId;
        await tokenMatcher(req, res, userId);

        let user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'User not found!'               
            })
        }

        let quiz = await Meetingquiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'Quiz not found!'               
            })
        }

        if (!quiz.quizMembers.includes(user.username)) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'You are not invited to this quiz!'               
            })
        }

        if (!quiz.quizMembers.includes(userName)) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'Asker not in the meeting!'               
            })
        }

        if (quiz.quizStatus == 'closed') {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'Meeting not yet started!'               
            })
        }

        if (quiz.quizTo == user.username) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'You cannot mark yourself!'               
            })
        }

        if (quiz.quizAdmin != user._id) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'Only meeting admin can mark!'               
            })
        }

        quiz.firedAskers = [...quiz.firedAskers, {
            foolishQuestion: qnId,
            asker: userName
        }];

        await Meetingquiz.findOneAndUpdate({ _id: quiz._id }, quiz, { new: true })
            .then(() => {

                res.status(200).send({
                    success: true,
                    status: 200,
                    message: 'Quiz passed.',
                    data: quiz
                })

            }).catch((err) => {
                res.status(400).send({
                    success: false,
                    status: 400,
                    message: err.message
                })
            })

    } catch(err) {
        res.status(400).send({
            success: false,
            status: 400,
            message: err.message
        })
    }
}


exports.getQuiz = async (req, res) => {
    try {
        const userId = req.params.userId;
        const quizId = req.params.quizId;
        await tokenMatcher(req, res, userId);

        let user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'User not found!'               
            })
        }

        let quiz = await Meetingquiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'Quiz not found!'               
            })
        }

        if (!quiz.quizMembers.includes(user.username)) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'You are not invited to this quiz!'               
            })
        }

        res.status(200).send({
            success: true,
            status: 200,
            message: 'Quiz here.',
            data: quiz
        })
    } catch(err) {
        res.status(400).send({
            success: false,
            status: 400,
            message: err.message
        })
    }
}



const { Router } = require('express');
const meetingQuizRouter = Router();
const { uploadFile } = require('../utils/fileUploader');
const file_upload = uploadFile("public/meetingquiz");
const { auth } = require('../middlewares/auth.middleware');
const { 
    addQuiz,
    inviteMember,
    changeStatus,
    addQuestion,
    failedQuestion,
    passedQuestion,
    fireAsker,
    joinWorkspace,
    joinPublicWorkspace,
    getOneWorkspace,
    getQuiz
} =  require('../controllers/meetingQuiz.controller');

/**
 * @description To create a new quiz
 * @api v1/api/meetingquiz/:userId/:workspaceId
 * @access Private
 * @type POST
 */

meetingQuizRouter.post('/:userId/:workspaceId', auth, addQuiz);

// /**
//  * @description To get one workspace's info
//  * @api v1/api/meetingquiz/:userId/:workspaceId
//  * @access Private
//  * @type GET
//  */

// meetingQuizRouter.get('/:userId/:workspaceId', auth, getOneWorkspace);

/**
 * @description To invite a new member
 * @api v1/api/meetingquiz/:userId/:quizId/invite/:invitedId
 * @access Private
 * @type POST
 */

meetingQuizRouter.post('/:userId/:quizId/invite/:invitedId', auth, inviteMember);

/**
 * @description To change meeting status
 * @api v1/api/meetingquiz/:userId/:quizId/status
 * @access Private
 * @type POST
 */

meetingQuizRouter.post('/:userId/:quizId/status', auth, changeStatus);

/**
 * @description To add question in meeting
 * @api v1/api/meetingquiz/:userId/:quizId/question
 * @access Private
 * @type POST
 */

meetingQuizRouter.post('/:userId/:quizId/question', auth, addQuestion);

/**
 * @description To failed to a question
 * @api v1/api/meetingquiz/:userId/:quizId/failed
 * @access Private
 * @type POST
 */

meetingQuizRouter.post('/:userId/:quizId/:questionId', auth, failedQuestion);

/**
 * @description To passed a question
 * @api v1/api/meetingquiz/:userId/:quizId/passed
 * @access Private
 * @type POST
 */

meetingQuizRouter.post('/:userId/:quizId/:questionId/passed', auth, passedQuestion);

/**
 * @description To fire Asker
 * @api v1/api/meetingquiz/:userId/:quizId/:userName
 * @access Private
 * @type POST
 */

meetingQuizRouter.post('/:userId/:quizId/:questionId/:userName', auth, fireAsker);

// /**
//  * @description To join a workspace
//  * @api v1/api/meetingquiz/join/:token
//  * @access Private
//  * @type POST
//  */

// meetingQuizRouter.post('/join/:token', auth, joinWorkspace);

// /**
//  * @description To join public workspace
//  * @api v1/api/meetingquiz/:userId/:workspaceId/join
//  * @access Private
//  * @type POST
//  */

// meetingQuizRouter.post('/:userId/:workspaceId/join', auth, joinPublicWorkspace);

/**
 * @description To get quiz
 * @api v1/api/meetingquiz/
 * @access Public
 * @type GET
 */

meetingQuizRouter.get('/:userId/:quizId', auth, getQuiz);


exports.meetingQuizRouter = meetingQuizRouter;
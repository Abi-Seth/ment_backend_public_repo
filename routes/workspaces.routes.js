const { Router } = require('express');
const workspaceRouter = Router();
const { uploadFile } = require('../utils/fileUploader');
const file_upload = uploadFile("public/workspaces");
const { auth } = require('../middlewares/auth.middleware');
const { 
    addWorkspace,
    inviteMember,
    joinWorkspace,
    joinPublicWorkspace,
    deleteMember,
    getOneWorkspace,
    updateWorkspace,
    deleteWorkspace,
    getAllWorkspaces
} =  require('../controllers/workspaces.controller');

/**
 * @description To create a new Workspace
 * @api v1/api/workspace/:workspace
 * @access Private
 * @type POST
 */

workspaceRouter.post('/:userId', auth, addWorkspace);

// /**
//  * @description To update Workspace info
//  * @api v1/api/workspace/:userId/:workspaceId
//  * @access Private
//  * @type PUT
//  */

// workspaceRouter.put('/:userId/:workspace', auth, file_upload.single('workspaceLogo'), updateWorkspace);

/**
 * @description To get one workspace's info
 * @api v1/api/workspace/:userId/:workspaceId
 * @access Private
 * @type GET
 */

workspaceRouter.get('/:userId/:workspaceId', auth, getOneWorkspace);

/**
 * @description To invite a new member
 * @api v1/api/workspace/:userId/:workspaceId/invite/:inviteEmail
 * @access Private
 * @type POST
 */

workspaceRouter.post('/:userId/:workspaceId/invite/:inviteEmail', auth, inviteMember);

/**
 * @description To join a workspace
 * @api v1/api/workspace/join/:token
 * @access Private
 * @type POST
 */

workspaceRouter.post('/join/:token', auth, joinWorkspace);

/**
 * @description To join public workspace
 * @api v1/api/workspace/:userId/:workspaceId/join
 * @access Private
 * @type POST
 */

workspaceRouter.post('/:userId/:workspaceId/join', auth, joinPublicWorkspace);

// /**
//  * @description To delete workspace
//  * @api v1/api/workspace/:userId/:workspaceId
//  * @access Private
//  * @type DELETE
//  */

// workspaceRouter.delete('/:userId/:workspaceId', auth, deleteWorkspace);

// /**
//  * @description To delete workspace member
//  * @api v1/api/workspace/:userId/:workspaceId/member
//  * @access Private
//  * @type DELETE
//  */

// workspaceRouter.delete('/:userId/:workspaceId/member', auth, deleteMember);

/**
 * @description To get all Workspaces
 * @api v1/api/workspace/
 * @access Public
 * @type GET
 */

workspaceRouter.get('/', getAllWorkspaces);


exports.workspaceRouter = workspaceRouter;
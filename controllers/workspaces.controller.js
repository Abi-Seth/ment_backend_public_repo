const _ = require('lodash');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');
const { Workspace } = require('../models/workspaces.model');
const { APP_DOMAIN, APP_FRONTEND_DOMAIN, AUTH_SECRET } = require('../constants/index.constants');
const { 
    validateWorkspaceRegisteration,
} = require('../validators/workspaces.validator');
const { sendEmail } = require('../utils/sendEmails');
const { tokenMatcher } = require('../middlewares/tokenMatcher.middleware');

exports.addWorkspace = async (req, res) => {
    try {
        const userId = req.params.userId;
        await tokenMatcher(req, res, userId);

        let user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'User not found!'               
            })
        }

        const workspace = req.body;

        const validateWorkspaceInput = validateWorkspaceRegisteration(workspace);

        if (validateWorkspaceInput.error) {
            return res.status(400).send(validateWorkspaceInput.error.details[0].message);
        }

        const duplicateWorkspaceName = await Workspace.findOne({ workspaceName: workspace.workspaceName });
        if (duplicateWorkspaceName) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'Workspace with this name is already registered!'
            })
        }

        let workspaceData = {
            workspaceName: workspace.workspaceName,
            workspaceDescription: workspace.workspaceDescription,
            workspaceAdmins: [userId],
            workspaceMembers: [userId],
            workspaceLogo: '',
            workspaceType: workspace.workspaceType
        }

        if (req.file != undefined)
            workspaceData.workspaceLogo = `${APP_DOMAIN}public/workspaces/${req.file.filename}`;

        const newWorkspace = new Workspace(_.pick(workspaceData, ['workspaceName', 'workspaceDescription', 'workspaceAdmins', 'workspaceMembers', 'workspaceLogo', 'workspaceType']));

        //added workspace to profile
        user.workspaces = [...user.workspaces, newWorkspace._id];

        await newWorkspace.save()
            .then(() => {
                const subject = `Ment: Workspace creation awareness.` 
                const html = `
                    <p style="font-family: Poppins">Hello ${user.username},</p>
                    <h2 style="font-family: Poppins">Workspace creation awareness.</h2>
                    <p style="font-family: Poppins">Thank you for creating a new workspace on Ment. We are pleased to know your hummies.</p>
                    <p style="font-family: Poppins">You and your hummies can now start rocking 🔥</p>
                    <br>
                    <a style="padding: 0.9em 2em; background: #FF3834; font-family: Poppins !important; border-radius: 0.3em; color: white; font-size: 0.88em; text-decoration: none; margin: 2em 0;" target="_blank" href='${APP_FRONTEND_DOMAIN}app'>Start rocking</a>
                    <br>
                `;
                sendEmail(user.email, subject, html);

                user.save();

                res.status(201).send({
                    success: true,
                    status: 201,
                    message: 'Workspace created successfully.',
                    data: newWorkspace
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
        const inviteEmail = req.params.inviteEmail;
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

        let userInvited = await User.findOne({ email: inviteEmail });
        
        if (!userInvited) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'User you want to invite is not found!'               
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

        if (!workspace.workspaceAdmins.includes(userId)) {
            return res.status(401).send({
                success: false,
                status: 401,
                message: 'Only admins can invite users!'               
            })
        }

        for(let i = 0; i < workspace.workspacePendingInvites.length; i++) {
            if (workspace.workspacePendingInvites[i].user == userInvited._id) {
                return res.status(400).send({
                    success: false,
                    status: 400,
                    message: 'User already invited to the workspace!'               
                })
            }
        }

        if (workspace.workspaceMembers.includes(userInvited._id)) {
            return res.status(400).send({
                success: false,
                status: 400,
                message: 'User already joined the workspace!'               
            })
        }

        let token =  await workspace.generateInvitationToken(userInvited);
        workspace.workspacePendingInvites = [...workspace.workspacePendingInvites, {
            user: userInvited._id,
            token: token
        }];

        await workspace.save()
            .then(() => {
                const subject = `Ment: Invitation to join ${workspace.workspaceName}.` 
                const html = `
                    <p style="font-family: Poppins">Hello ${userInvited.username},</p>
                    <h2 style="font-family: Poppins">Ready to meet new hummies 🔥.</h2>
                    <p style="font-family: Poppins">${user.username} has just invited you to join a workspace full of your hummies ${workspace.workspaceName}.</p>
                    <p style="font-family: Poppins">You and your hummies can now start rocking 🔥 now</p>
                    <br>
                    <a style="padding: 0.9em 2em; background: #FF3834; font-family: Poppins !important; border-radius: 0.3em; color: white; font-size: 0.88em; text-decoration: none; margin: 2em 0;" target="_blank" href='${APP_FRONTEND_DOMAIN}joinworkspace/${token}'>Start rocking</a>
                    <br>
                `;
                sendEmail(userInvited.email, subject, html);

                res.status(200).send({
                    success: true,
                    status: 200,
                    message: 'Invitation successful.'
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

exports.joinWorkspace = async (req, res) => {
    try {
        const inviteToken = req.params.token;

        try {
            
            const decoded = await jwt.verify(inviteToken, AUTH_SECRET);
            
            if (!decoded.workspaceId || !decoded.id) {
                return res.status(403).send({
                    success: false,
                    status: 403,
                    message: 'Invalid verification token'
                })
            }

            let user = await User.findById(decoded.id);
        
            if (!user) {
                return res.status(404).send({
                    success: false,
                    status: 404,
                    message: 'User not found!'               
                })
            }
    
            let workspace = await Workspace.findById(decoded.workspaceId);
            
            if (!workspace) {
                return res.status(404).send({
                    success: false,
                    status: 404,
                    message: 'Workspace not found!'               
                })
            }

            for(let i = 0; i < workspace.workspacePendingInvites.length; i++) {
                if (workspace.workspacePendingInvites[i].user != decoded.id && i == (workspace.workspacePendingInvites.length-1)) {
                    return res.status(400).send({
                        success: false,
                        status: 400,
                        message: 'You are not invited to this workspace!'               
                    })
                }
            }
    
            if (workspace.workspaceMembers.includes(decoded.id)) {
                return res.status(400).send({
                    success: false,
                    status: 400,
                    message: 'You have already joined the workspace!'               
                })
            }
    
            for(let i = 0; i < workspace.workspacePendingInvites.length; i++) {
                if (workspace.workspacePendingInvites[i].user == decoded.id && workspace.workspacePendingInvites[i].token == inviteToken) {
                    workspace.workspacePendingInvites.splice(i, 1);
                    break;
                }
            }
            workspace.workspaceMembers = [...workspace.workspaceMembers, decoded.id];
            user.workspaces = [...user.workspaces, decoded.workspaceId];
    
            await workspace.save()
                .then(() => {
                    const subject = `Ment: Great news 🔥.`
                    const html = `
                        <p style="font-family: Poppins">Hello ${user.username},</p>
                        <h2 style="font-family: Poppins">You just joined a new workspace ${workspace.workspaceName} 🔥.</h2>
                        <p style="font-family: Poppins">${user.username} you have successfully joined a new workspace on Ment.</p>
                        <p style="font-family: Poppins">You and your hummies can now start rocking 🔥 now</p>
                        <br>
                        <a style="padding: 0.9em 2em; background: #FF3834; font-family: Poppins !important; border-radius: 0.3em; color: white; font-size: 0.88em; text-decoration: none; margin: 2em 0;" target="_blank" href='${APP_FRONTEND_DOMAIN}app'>Start rocking</a>
                        <br>
                    `;
                    sendEmail(user.email, subject, html);

                    user.save();
    
                    res.status(200).send({
                        success: true,
                        status: 200,
                        message: 'Joined successfully.',
                        data: workspace
                    })
    
                }).catch((err) => {
                    res.status(400).send({
                        success: false,
                        status: 400,
                        message: err.message
                    })
                })

        } catch (err) {
            res.status(400).send({
                success: false,
                status: 400,
                message: 'Invalid auth token - ' + err.message
            })
        }

    } catch(err) {
        res.status(400).send({
            success: false,
            status: 400,
            message: err.message
        })
    }
}

exports.joinPublicWorkspace = async (req, res) => {
    try {
        const userId = req.params.userId;
        const workspaceName = req.params.workspaceId;
        await tokenMatcher(req, res, userId);

        let user = await User.findById(userId);
    
        if (!user) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'User not found!'               
            })
        }

        let workspace = await Workspace.findOne({ workspaceName: workspaceName });
        
        if (!workspace) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'Workspace not found!'               
            })
        }

        if (workspace.workspaceMembers.includes(userId)) {
            return res.status(400).send({
                success: false,
                status: 400,
                message: 'You have already joined the workspace!'               
            })
        }

        for(let i = 0; i < workspace.workspacePendingInvites.length; i++) {
            if (workspace.workspacePendingInvites[i].user == userId) {
                workspace.workspacePendingInvites.splice(i, 1);
                break;
            }
        }
        workspace.workspaceMembers = [...workspace.workspaceMembers, userId];
        user.workspaces = [...user.workspaces, workspace._id];

        await workspace.save()
            .then(() => {
                const subject = `Ment: Great news 🔥.`
                const html = `
                    <p style="font-family: Poppins">Hello ${user.username},</p>
                    <h2 style="font-family: Poppins">You just joined a new workspace ${workspace.workspaceName} 🔥.</h2>
                    <p style="font-family: Poppins">${user.username} you have successfully joined a new workspace on Ment.</p>
                    <p style="font-family: Poppins">You and your hummies can now start rocking 🔥 now</p>
                    <br>
                    <a style="padding: 0.9em 2em; background: #FF3834; font-family: Poppins !important; border-radius: 0.3em; color: white; font-size: 0.88em; text-decoration: none; margin: 2em 0;" target="_blank" href='${APP_FRONTEND_DOMAIN}app'>Start rocking</a>
                    <br>
                `;
                sendEmail(user.email, subject, html);

                user.save();

                res.status(200).send({
                    success: true,
                    status: 200,
                    message: 'Joined successfully.',
                    data: workspace
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

exports.getAllWorkspaces = async (req, res) => {
    try {
        const publicWorkspaces = await Workspace.find({ workspaceType: 'public' }).sort({_id: -1});

        res.status(200).send({
            success: true,
            status: 200,
            message: 'All public workspaces',
            data: publicWorkspaces
        })

    }catch(err) {
        res.status(400).send({
            success: false,
            status: 400,
            message: err.message
        })
    }
}

exports.getOneWorkspace = async (req, res) => {
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

        if (workspace.workspaceType == 'private') {
            if (!workspace.workspaceMembers.includes(userId)) {
                return res.status(403).send({
                    success: false,
                    status: 403,
                    message: 'You cannot get data of a workspace you are not a member of!'               
                })
            }
        }

        res.status(200).send({
            success: true,
            status: 200,
            message: 'Workspace data',
            data: workspace
        })

    }catch(err) {
        res.status(400).send({
            success: false,
            status: 400,
            message: err.message
        })
    }
}
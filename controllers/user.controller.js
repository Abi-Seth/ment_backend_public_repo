const _ = require('lodash');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { v4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');
const { APP_DOMAIN, APP_FRONTEND_DOMAIN, AUTH_SECRET } = require('../constants/index.constants');
const { 
    validateUserRegisteration, 
    validateUserAuthenatication, 
    validateUserUpdation 
} = require('../validators/user.validator');
const { sendEmail } = require('../utils/sendEmails');
const { tokenMatcher } = require('../middlewares/tokenMatcher.middleware');

exports.addUser = async (req, res) => {
    try {
        const user = req.body;
        const validateUserInput = validateUserRegisteration(user);

        if (validateUserInput.error) {
            return res.status(400).send(validateUserInput.error.details[0].message);
        }

        const duplicateUsername = await User.findOne({ username: user.username });
        if (duplicateUsername) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'User with this username is already registered!'
            })
        }

        const duplicateEmail = await User.findOne({ email: user.email });
        if (duplicateEmail) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'User with this email is already registered!'
            })
        }

        const userData = {
            username: user.username,
            email: user.email,
            password: user.password,
            verificationToken: ''
        }

        const newUser = new User(_.pick(userData, ['username', 'email', 'password', 'verificationToken']));

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(newUser.password, salt);

        const verificationData = {
            username: user.username,
            email: user.email,
            radId: v4()
        }
        newUser.verificationToken = await newUser.generateVerificationToken(verificationData);

        await newUser.save()
            .then(() => {
                const subject = `Ment: Account verification.` 
                const html = `
                    <p style="font-family: Poppins">Hello ${newUser.username},</p>
                    <h2 style="font-family: Poppins">Verify your account.</h2>
                    <p style="font-family: Poppins">Thank you for registering on Ment. We are pleased to welcome you here.</p>
                    <p style="font-family: Poppins">Verify your email within 2 days before it is expires. Other wises you really rock 🔥</p>
                    <br>
                    <a style="padding: 0.9em 2em; background: #FF3834; font-family: Poppins !important; border-radius: 0.3em; color: white; font-size: 0.88em; text-decoration: none; margin: 2em 0;" target="_blank" href='${APP_FRONTEND_DOMAIN}verifyaccount/${newUser.verificationToken}'>Verify email</a>
                    <br>
                `;
                sendEmail(newUser.email, subject, html);

                res.status(201).send({
                    success: true,
                    status: 201,
                    message: 'User created successfully.',
                    data: newUser
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

exports.updateUser = async (req, res) => {
    try {

        const userId = req.params.userId;
        let user;
        await tokenMatcher(req, res, userId);
        user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'User not found!'               
            })
        }
        
        const duplicateUsername = await User.findOne({
            _id: {
                $ne: userId
            },
            username: req.body.username
        })
        
        if (duplicateUsername) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'Username already registered!'
            })
        }
        
        const duplicateEmail = await User.findOne({
            _id: {
                $ne: userId
            },
            email: req.body.email
        })
        
        if (duplicateEmail) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'Email address already registered!'
            })
        }
        
        try {
            
            const validateUserInput = validateUserUpdation(_.pick(req.body, ['username', 'email']));

            if (validateUserInput.error) {
                return res.status(400).send(validateUserInput.error.details[0].message);
            }

            let newpassword = '';

            if (req.body.password !== '') {
                const salt = await bcrypt.genSalt(10);
                newpassword = await bcrypt.hash(req.body.password, salt);
            } else {
                newpassword = user.password;
            }

            let currentProfilePicture = req.file;
            let profilePicturePath;
            let imageInfo;

            //upload image
            if (!currentProfilePicture) {
                if (user.profilePicture != `${APP_DOMAIN}public/users/defaultAvatar.png`) {
                    profilePicturePath = user.profilePicture;
                } else {
                    profilePicturePath = `${APP_DOMAIN}public/users/defaultAvatar.png`;
                }

                imageInfo = {
                    "secure_url": profilePicturePath,
                }
            } else {

                if (user.profilePicture != `${APP_DOMAIN}public/users/defaultAvatar.png`) {

                    let file = user.profilePicture;
                    let filenametodel = file.split('/')[6];
                    let deletefile = 'public/users/'+filenametodel;

                    fs.unlink(deletefile, (err) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                    })

                }
                
                profilePicturePath = `${APP_DOMAIN}public/users/${req.file.filename}`;

                imageInfo = {
                    "secure_url": profilePicturePath
                }
            }

            let updatedUser = await User.findOneAndUpdate({ _id: userId }, {
                username: req.body.username,
                email: req.body.email,
                password: newpassword,
                profilePicture: imageInfo.secure_url
            }, { new: true })

            res.status(200).send({
                success: true,
                status: 200,
                message: 'User updated successfully',
                data: updatedUser
            }) 

        } catch(err) {
            res.status(400).send({
                success: false,
                status: 400,
                message: err.message
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

exports.getOneUser = async (req, res) => {
    try {

        const user = await User.findById({
            _id: req.params.userId
        })

        if (!user){
            return res.status(404).send({
                success: false,
                status: 404,
                message: "User not found!"
            })
        }

        var user_data = {
            "createdAt": user.createdAt,
            "email": user.email,
            "profilePicture": user.profilePicture,
            "updatedAt": user.updatedAt,
            "username": user.username,
            "workspaces": user.workspaces,
            "__v": user.__v,
            "_id": user._id
        }

        return res.status(200).send({
            success: true,
            status: 200,
            message: "User found.",
            data: user_data
        })

    } catch (err) {
        res.status(400).send({
            success: false,
            status: 400,
            message: err.message
        })
    }
}

exports.authenaticateUser = async (req, res) => {
    try {
        const validateUserInput = validateUserAuthenatication(_.pick(req.body, ['email', 'password', 'remember']));

        if (validateUserInput.error) {
            return res.status(400).send(validateUserInput.error.details[0].message);
        }

        let user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'Incorrect email or password!'
            })
        }

        const validPassword = await bcrypt.compare( req.body.password, user.password );

        if (!validPassword) {
            return res.status(400).send({
                success: false,
                status: 400,
                message: 'Incorrect email or password!'
            })
        }

        if (!user.verified) {
            return res.status(403).send({
                success: false,
                status: 403,
                message: 'Your account is not verified. Check your email to do so.'
            })
        }

        const token = await user.generateAuthToken(req.body.remember);
        res.status(200).send({
            success: true,
            status: 200,
            message: 'You are logged in!',
            data: {
                token: token
            }
        })

    } catch(err) {
        res.status(400).send({
            success: false,
            status: 400,
            message: err.message
        })
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({_id: -1});

        res.status(200).send({
            success: true,
            status: 200,
            message: 'All Users',
            data: users
        })

    }catch(err) {
        res.status(400).send({
            success: false,
            status: 400,
            message: err.message
        })
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        await tokenMatcher(req, res, userId);

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: 'User not found!'
            })
        }

        await User.findByIdAndDelete(user)
            .then(() => {
                res.status(200).send({
                    success: true,
                    status: 200,
                    message: 'User deleted successfully!'
                })
            })
            .catch((err) => {
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


exports.verifyAccount = async (req, res) => {
    try {
        const token = req.params.token;

        try {
            
            const decoded = await jwt.verify(token, AUTH_SECRET);
            
            if (!decoded.email) {
                return res.status(403).send({
                    success: false,
                    status: 403,
                    message: 'Invalid verification token'
                })
            }

            let user = await User.findOne({ email: decoded.email });

            if (user.verified) {
                return res.status(403).send({
                    success: false,
                    status: 403,
                    message: 'Account already verified'
                })
            }

            user.verified = true;

            await user.save()
                .then(() => {
                    res.status(200).send({
                        success: true,
                        status: 200,
                        message: 'Account verified!'
                    })
                })
                .catch((err) => {
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


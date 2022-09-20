const { Router } = require('express');
const userRouter = Router();
const { uploadFile } = require('../utils/fileUploader');
const file_upload = uploadFile("public/users");
const { auth } = require('../middlewares/auth.middleware');
const { 
    addUser,
    updateUser,
    authenaticateUser,
    getOneUser,
    deleteUser,
    getAllUsers,
    verifyAccount
} =  require('../controllers/user.controller');

/**
 * @description To create a new user
 * @api v1/api/user/
 * @access Private
 * @type POST
 */

userRouter.post('/', addUser);

/**
 * @description To update user info
 * @api v1/api/user/:userId
 * @access Private
 * @type PUT
 */

userRouter.put('/:userId', auth, file_upload.single('profilePicture'), updateUser);

/**
 * @description To get one user's info
 * @api v1/api/user/:userId
 * @access Private
 * @type GET
 */

userRouter.get('/:userId', auth, getOneUser);

/**
 * @description To delete one user's info
 * @api v1/api/user/:userId
 * @access Private
 * @type DELETE
 */

userRouter.delete('/:userId', auth, deleteUser);

/**
 * @description To get all users' info
 * @api v1/api/user/
 * @access Private
 * @type GET
 */

userRouter.get('/', auth, getAllUsers);

/**
 * @description To login a user
 * @api v1/api/user/authenaticate
 * @access Public
 * @type POST
 */

userRouter.post('/authenaticate', authenaticateUser);

/**
 * @description To verify account
 * @api v1/api/user/verify/:token
 * @access Public
 * @type POST
 */

userRouter.post('/verify/:token', verifyAccount);

exports.userRouter = userRouter;
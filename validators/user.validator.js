const Joi = require('joi');

exports.validateUserRegisteration = (body) => {
    const validUserRegisterSchema = Joi.object({
        username: Joi.string().max(80).min(3).required(),
        email: Joi.string().min(5).required(),
        password: Joi.string().min(6).required(),
        profilePicture: Joi.string()
    })
    return validUserRegisterSchema.validate(body);
}

exports.validateUserAuthenatication = (body) => {
    const validUserAuthenaticateSchema = Joi.object({
        email: Joi.string().max(80).min(5).required(),
        password: Joi.string().min(6).required(),
        remember: Joi.boolean().required()
    })
    return validUserAuthenaticateSchema.validate(body);
}

exports.validateUserUpdation = (body) => {
    const validateUserUpdationSchema = Joi.object({
        email: Joi.string().max(80).min(5).required(),
        username: Joi.string().min(3).required()
    })
    return validateUserUpdationSchema.validate(body);
}
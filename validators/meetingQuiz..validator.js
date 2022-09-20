const Joi = require('joi');

exports.validateQuizRegisteration = (body) => {
    const validQuizRegisterSchema = Joi.object({
        quizName: Joi.string().max(15).min(1).required(),
        quizDescription: Joi.string().min(5).required(),
        quizStatus: Joi.string(),
        quizShowType: Joi.string(),
        quizMembers: Joi.array(),
        startDate: Joi.string().required(),
        quizTo: Joi.string().required()
    })
    return validQuizRegisterSchema.validate(body);
}

exports.validateQuizInvitation = (body) => {
    const validQuizInvitationSchema = Joi.object({
        quizMembers: Joi.array().required()
    })
    return validQuizInvitationSchema.validate(body);
}

exports.validateQuizQuestion = (body) => {
    const validQuizQuestionSchema = Joi.object({
        quizQuestion: Joi.string().required()
    })
    return validQuizQuestionSchema.validate(body);
}
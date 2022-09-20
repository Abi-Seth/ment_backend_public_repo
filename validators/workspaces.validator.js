const Joi = require('joi');

exports.validateWorkspaceRegisteration = (body) => {
    const validWorkspaceRegisterSchema = Joi.object({
        workspaceName: Joi.string().max(15).min(1).required(),
        workspaceDescription: Joi.string().min(5).required(),
        workspaceType: Joi.string().required()
    })
    return validWorkspaceRegisterSchema.validate(body);
}
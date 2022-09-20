const { config } = require('dotenv');

config()

exports.DB = process.env.APP_DB;
exports.AUTH_SECRET = process.env.APP_SECRET;
exports.APP_DOMAIN = process.env.APP_DOMAIN;
exports.APP_PORT = process.env.APP_PORT;
exports.APP_FRONTEND_DOMAIN = process.env.APP_FRONTEND_DOMAIN;
exports.EMAIL = process.env.APP_EMAIL;
exports.MAILSECRET = process.env.APP_MAILSECRET;
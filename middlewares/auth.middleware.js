const jwt = require('jsonwebtoken');
const { AUTH_SECRET } = require('../constants/index.constants');

function auth(req, res, next) {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).send({
            success: false,
            status: 401,
            message: 'Unauthorized! Please first login.'
        })
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], AUTH_SECRET);

        if (decoded.email && decoded.username) {
            next();
        } else {
            throw 'Invalid token noticed!'
        }

    } catch (err) {
        res.status(401).send({
            success: false,
            status: 401,
            message: 'Invalid token && ' + err.message
        })
    }

}

exports.auth = auth;
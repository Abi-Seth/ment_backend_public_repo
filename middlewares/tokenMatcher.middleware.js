const jwt = require('jsonwebtoken');
const { AUTH_SECRET } = require('../constants/index.constants');

exports.tokenMatcher = (req, res, userId) => {
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

        if (!decoded.email || !decoded.username || decoded._id != userId) {
            throw 'Unauthorized to perform this.';
        }

    } catch (err) {
        res.status(401).send({
            success: false,
            status: 401,
            message: 'Unauthorized to perform this.'
        })
    }

}
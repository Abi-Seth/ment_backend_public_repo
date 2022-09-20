const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const { APP_PORT } = require('./constants/index.constants')

const PORT = process.env.PORT || APP_PORT;

require('./models/database.js');

const { userRouter } = require('./routes/user.routes');
const { workspaceRouter } = require('./routes/workspaces.routes');
const { meetingQuizRouter } = require('./routes/meetingQuiz.routes');

app.use(cors());
// app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '100mb' }));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
});

app.use("/public", express.static("public"));

app.use('/v1/api/user', userRouter);
app.use('/v1/api/workspace', workspaceRouter);
app.use('/v1/api/meetingquiz', meetingQuizRouter);

app.use('/', (req, res) => {
    return res.status(200).send({
        success: true,
        status: 200,
        message: 'Welcome to Ment.'
    })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}!`);
})
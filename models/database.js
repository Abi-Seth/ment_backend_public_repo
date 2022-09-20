const mongoose = require('mongoose');
const { DB } = require('../constants/index.constants');

mongoose.connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    console.log('Connected to mongodb . . .');
}).catch((err) => {
    console.log(err)
})
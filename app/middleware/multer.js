'use strict';

const multer = require('multer');
const storage = multer.memoryStorage(); // don't do this with real apps
// you will run out of memory and your app will crash

module.exports = multer({ storage });

// bin/s3-upload.js
'use strict';

// 1: internal Node modules
const fs = require('fs');

// 2: downloaded Node modules
const awsUpload = require('../lib/s3-upload').upload;

// 3: modules from our own code
const mongoose = ('../app/middleware/mongoose');
const Upload = require('../app/models/upload');

const filename = process.argv[2] || '';
const comment = process.argv[3] || 'No comment';

const readFile = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (error, data) => {
      if (error) {
        reject(error);
      }

      resolve(data);
    });
  });
};

const createUpload = (response) => {
  // build up an object in a local variable that we'll later send to mongoose
  let upload = {
    location: response.Location,
    comment: comment,
  };

  return Upload.create(upload);
};

// log a message about whatever we got at the end of a successful promise chain
const logMessage = (upload) => {
  console.log(`the upload was ${JSON.stringify(upload)}`);
};

readFile(filename)
.then(awsUpload)
.then(createUpload)
.then(logMessage)
.catch(console.error)
.then( () => mongoose.connection.close)
;

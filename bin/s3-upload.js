'use strict';

// this has to come before anything else
require('dotenv').config();
// note that we are not saving the module to a variable; we are requiring the
// object that it exports, and firing the .config method on it
// it is the same as saying:
//    const throwaway = require('dotenv');
//    throwaway.config();
// doing it the second way would be 'useless assignment
// to an intermediary variable'

const fs = require('fs');
const fileType = require('file-type');
// we are breaking convention to name this in all caps so that it is
// consistent with the Amazon documentation
const AWS = require('aws-sdk');

const filename = process.argv[2] || '';

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

// return a default object in the case that file-type is given an unsupported
// file type to read
const mimeType = (data) => {
  return Object.assign({
    // these default properties say 'hey, this is just a stream of bytes
    // with no metadata'
    ext: 'bin',
    mime: 'application/octet-stream'
  }, fileType(data));
};

// attach the data and the mime type to a returned object
const parseFile = (fileBuffer) => {
  let file = mimeType(fileBuffer);
  file.data = fileBuffer;
  return file;
};

// returns and instance of the S3 manager that will be authenticated
const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const upload = (file) => {
  const options = {
    // get the bucket name from your AWS S3 console
    Bucket: 'kopius-wdi',
    // attach the fileBuffer as a stream to send to S3
    Body: file.data,
    // allow anyone to access the URL of the uploaded file
    ACL: 'public-read',
    // tell S3 what the mime-type is
    ContentType: file.mime,
    // pick a filename for S3 to use
    Key: `test/test.${file.ext}`
  };

  return new Promise((resolve, reject) => {
    s3.upload(options, (error,data) => {
      if (error) {
        reject(error);
      }

      resolve(data);
    });
  });
};

const logMessage = (response) => {
  // turn the pojo into a string so we can see it on the console
  console.log(`the response from AWS was ${JSON.stringify(response)}`);
};

// call readFile and pass it the filename to initiate the Promise chain
readFile(filename)
.then(parseFile)
.then(upload)
.then(logMessage)
.catch(console.error)
;

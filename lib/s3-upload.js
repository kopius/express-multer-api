// lib/s3-upload.js
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

const crypto = require('crypto');

const fileType = require('file-type');
const AWS = require('aws-sdk');

// return a default object in the case that fileType is given an unsupported
// filetype to read
const mimeType = (data) => {
  return Object.assign({
    ext: 'bin',
    mime: 'application/octet-stream',
  }, fileType(data));
};

// parse the file buffer and pin it to a file object
const parseFile = (fileBuffer) => {
  let file = mimeType(fileBuffer);
  file.data = fileBuffer;
  return file;
};

const randomHexString = (length) => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, (error, buffer) => {
      if (error) {
        reject(error);
      }

      resolve(buffer.toString('hex'));
    });
  });
};

// name the file for the upload
const nameFile = (file) => {
  return randomHexString(16)
  .then((val) => {
    file.name = val;
    return file;
  });
};

// name the directory
const nameDirectory = (file) => {
  file.dir = new Date().toISOString().split('T')[0];
  return file;
};

// returns an instance of the S3 manager that will be authenticated
const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// define options for the file upload and return a new Promise
// with a callback that attempts to upload the file
const uploadToS3 = (file) => {
  const options = {
    // get the bucket name from your AWS S3 console
    Bucket: 'kopius-wdi',
    // attach the fileBuffer as a stream to send to S3
    Body: file.data,
    // allow anyone to access the URL of the uploaded file
    ACL: 'public-read',
    // tell S3 what the mime-type is
    ContentType: file.mime,
    // pick a filename for S3 to use for the upload
    Key: `${file.dir}/${file.name}.${file.ext}`
  };

  return new Promise((resolve, reject) => {
    s3.upload(options, (error, data) => {
      if (error) {
        reject(error);
      }

      resolve(data);
    });
  });
};

// define a function to export that does all the things
const upload = (file) => {
  let parsedFile = parseFile(file);

  return nameFile(parsedFile)
  .then(nameDirectory)
  .then(uploadToS3)
  ;
};

module.exports = {
  upload,
};

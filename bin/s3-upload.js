'use strict';

const fs = require('fs');
const fileType = require('file-type');

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
  // don't actually upload data yet; just pass the data down the Promise chain
  return Promise.resolve(options);
};

const logMessage = (upload) => {
  delete upload.Body; // this is temporary so we can log the rest of the options
  // turn the pojo into a string so we can see it on the console
  console.log(`the upload options are ${JSON.stringify(upload)}`);
};

// call readFile and pass it the filename to initiate the Promise chain
readFile(filename)
.then(parseFile)
.then(upload)
.then(logMessage)
.catch(console.error)
;

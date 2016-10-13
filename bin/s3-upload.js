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

const logMessage = (file) => {
  console.log(`${filename} is ${file.data.length} bytes long and is of mime type ${file.mime}`);
};

readFile(filename)
.then(parseFile)
.then(logMessage)
.catch(console.error)
;

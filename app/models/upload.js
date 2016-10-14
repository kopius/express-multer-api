'use strict';

const mongoose = require('mongoose');

// THIS WILL BE A HANDY REFERENCE FOR OUR UPLOAD ENTITY
// ESPECIALLY RE: METADATA, TAGS, ETC
const uploadSchema = new mongoose.Schema({
  // what about validating upload size?
  comment: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  }
}, {
  timestamps: true,
  }
);

uploadSchema.virtual('length').get(function() {
  // what is this.text?
  return this.text.length;
});

// this line is what allows us to do relationships
const Upload = mongoose.model('Upload', uploadSchema);

module.exports = Upload;

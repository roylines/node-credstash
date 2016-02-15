const AWS = require('aws-sdk');
const async = require('async');
const encoder = require('./encoder');

function decrypt(key, done) {
  var params = {
    CiphertextBlob: encoder.decode(key)
  };
  
  return new AWS.KMS().decrypt(params, done); 
}

function split(stash, decrypted, done) {
  stash.keyPlaintext = new Buffer(32);
  stash.hmacPlaintext = new Buffer(32);
  decrypted.Plaintext.copy(stash.keyPlaintext, 0, 0, 32);
  decrypted.Plaintext.copy(stash.hmacPlaintext, 0, 32);
  return done(null, stash);
}

module.exports = {
  decrypt: (stash, done) => {
  return async.waterfall([
    async.apply(decrypt, stash.key),
    async.apply(split, stash)
  ], done);
  }
}

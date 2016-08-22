'use strict';

const AWS = require('aws-sdk');
const async = require('async');
const encoder = require('./encoder');


function Keys(kmsKey, awsConfig) {
  this.kms = new AWS.KMS(awsConfig);
}

Keys.prototype.decrypt = function(context, stash, done) {
  let key = stash.key;
  var params = {
    CiphertextBlob: encoder.decode(key),
    EncryptionContext: context || {}
  };

  return this.kms.decrypt(params, (err, res) => {
    if (err) {
      let msg;
      if (err.code == 'InvalidCiphertextException') {
        if (context) {
          msg = "Could not decrypt hmac key with KMS. The encryption " +
            "context provided may not match the one used when the " +
            "credential was stored.";

        } else {
          msg = "Could not decrypt hmac key with KMS. The credential may " +
            "require that an encryption context be provided to decrypt " +
            "it.";
        }
      } else {
        msg = 'Decryption error: ' + err.message;
      }
      err.message = msg;
      return done(err);
    }
    done(null, res);
  });
};

function split(stashes, decryptedKeys, done) {
  var result = stashes.map((stash, index) => {
    stash.keyPlaintext = new Buffer(32);
    stash.hmacPlaintext = new Buffer(32);
    decryptedKeys[index].Plaintext.copy(stash.keyPlaintext, 0, 0, 32);
    decryptedKeys[index].Plaintext.copy(stash.hmacPlaintext, 0, 32);
    return stash;
  });
  return done(null, result);
}

Keys.prototype.decryptAll = function(context, stashes, done) {
  if (!Array.isArray(stashes)) {
    stashes = [stashes];
  }
  return async.waterfall([
    async.apply(async.map, stashes.map(s => s), this.decrypt.bind(this, context)),
    async.apply(split, stashes)
  ], done);
};


module.exports = Keys;

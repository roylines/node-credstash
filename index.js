const AWS = require('aws-sdk');
const aesjs = require('aes-js');  
const async = require('async');
const crypto = require('crypto');
const encoder = require('./lib/encoder');
const secrets = require('./lib/secrets');

function Credstash(config) {
  this.kms = new AWS.KMS();
}

function kmsDecrypt(kms, stash, done) {
  var params = {
    CiphertextBlob: encoder.decode(stash.key)
  };

  return kms.decrypt(params, (e, decrypted) => {
    return done(e, stash, decrypted);
  });
}

function splitKeys(stash, decrypted, done) {
  stash.keyPlaintext = new Buffer(32);
  stash.hmacPlaintext = new Buffer(32);
  decrypted.Plaintext.copy(stash.keyPlaintext, 0, 0, 32);
  decrypted.Plaintext.copy(stash.hmacPlaintext, 32);
  return done(null, stash);
}

function checkHMAC(stash, done) {
  // TODO - validate this
  return done(null, stash);
}

function decrypt(stash, done) {
  var key = stash.keyPlaintext;
  var value = encoder.decode(stash.contents);
  var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(1));
  var decryptedBytes = aesCtr.decrypt(value);
  return done(null, decryptedBytes.toString());
}

Credstash.prototype.get = function(name, done) {
  return async.waterfall([
    async.apply(secrets.get, name),
    async.apply(kmsDecrypt, this.kms),
    async.apply(splitKeys),
    async.apply(checkHMAC),
    async.apply(decrypt)
  ], done);
};

module.exports = Credstash;

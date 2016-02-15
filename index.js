const AWS = require('aws-sdk');
const aesjs = require('aes-js');  
const async = require('async');
const crypto = require('crypto');
const encoder = require('./lib/encoder');
const hmac = require('hmac');

function Credstash(config) {
  this.kms = new AWS.KMS();
  this.ddb = new AWS.DynamoDB();
}

function find(ddb, name, done) {
  var params = {
    TableName: 'credential-store',
    ConsistentRead: true,
    Limit: 1,
    ScanIndexForward: false,
    KeyConditions: {
      name: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [{
          S: name
        }]
      }
    }
  };

  return ddb.query(params, done);
}

function mapDDB(name, data, done) {
  if (!data.Items || data.Items.length != 1) {
    return done('secret not found', name);
  }

  var item = data.Items[0];

  var stash = {
    key: item.key.S,
    contents: item.contents.S,
    hmac: item.hmac.S
  };

  return done(null, stash);
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
    async.apply(find, this.ddb, name),
    async.apply(mapDDB, name),
    async.apply(kmsDecrypt, this.kms),
    async.apply(splitKeys),
    async.apply(checkHMAC),
    async.apply(decrypt)
  ], done);
};

module.exports = Credstash;

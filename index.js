const async = require('async');
const getAWS = require('./lib/aws').getAWS;
const decrypter = require('./lib/decrypter');
const encoder = require('./lib/encoder');
const hmac = require('./lib/hmac');
const keys = require('./lib/keys');
const secrets = require('./lib/secrets');
const xtend = require('xtend');

const defaults = {
  limit: 1,
  region: process.env.AWS_DEFAULT_REGION || 'eu-west-1',
  table: 'credential-store'
};

function Credstash(config) {
  this.config = xtend(defaults, config);
}

Credstash.prototype.list = function(options, done) {
  if (typeof options === 'function') {
    done = options;
    options = this.config;
  } else {
    options = xtend(this.config, options);
  }

  const AWS = getAWS(options);
  return async.waterfall([
    async.apply(secrets.list, AWS, options),
    async.apply(keys.decrypt, AWS),
    async.apply(hmac.check),
    async.apply(decrypter.decryptedObject)
  ], function (err, secrets) {
    if (err) {
      return done(err);
    }

    done(null, secrets);
  });
};

Credstash.prototype.get = function(name, options, done) {
  if (typeof options === 'function') {
    done = options;
    options = this.config;
  } else {
    options = xtend(this.config, options);
  }

  const AWS = getAWS(options);
  return async.waterfall([
    async.apply(secrets.get, AWS, name, options),
    async.apply(keys.decrypt, AWS),
    async.apply(hmac.check),
    async.apply(decrypter.decryptedList)
  ], function (err, secrets) {
    if (err) {
      return done(err);
    }

    if (options.limit === 1) {
      return done(null, secrets && secrets[0]);
    }

    done(null, secrets);
  });
};

module.exports = Credstash;

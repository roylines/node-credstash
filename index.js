const async = require('async');
const decrypter = require('./lib/decrypter');
const encoder = require('./lib/encoder');
const hmac = require('./lib/hmac');
const keys = require('./lib/keys');
const secrets = require('./lib/secrets');
const xtend = require('xtend');

const defaults = {
  limit: 1
};

function Credstash(config) {
  this.table = config ? config.table : undefined;
}

Credstash.prototype.list = function(options, done) {
  if (typeof options === 'function') {
    done = options;
    options = defaults;
  } else {
    options = xtend(defaults, options);
  }

  return async.waterfall([
    async.apply(secrets.list, this.table, options),
    async.apply(keys.decrypt),
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
    options = defaults;
  } else {
    options = xtend(defaults, options);
  }

  return async.waterfall([
    async.apply(secrets.get, this.table, name, options),
    async.apply(keys.decrypt),
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

const async = require('async');
const decrypter = require('./lib/decrypter');
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

Credstash.prototype.get = function(name, options, done) {
  if (typeof options === 'function') {
    done = options;
    options = defaults;
  } else {
    options = xtend(defaults, options);
  }

  return decrypt(secrets.get, this.table, name, options, function (err, secrets) {
    if (err) {
      return done(err);
    }

    var values = secrets && secrets.map(function (secret) {
      return secret.value;
    });

    if (options.limit === 1) {
      return done(null, values && values[0]);
    }

    done(null, values);
  });
};

Credstash.prototype.list = function(options, done) {
  if (typeof options === 'function') {
    done = options;
    options = defaults;
  } else {
    options = xtend(defaults, options);
  }

  return decrypt(secrets.list, this.table, options, function (err, secrets) {
    if (err) {
      return done(err);
    }

    var obj = {};
    secrets.forEach(function (secret) {
      obj[secret.key] = secret.value;
    });

    done(null, obj);
  });
};

function decrypt() {
  var _arguments = Array.prototype.slice.call(arguments);
  var args = _arguments.slice(0, _arguments.length - 1);
  var done = _arguments[_arguments.length - 1];

  return async.waterfall([
    async.apply.apply(async, args),
    async.apply(keys.decrypt),
    async.apply(hmac.check),
    async.apply(decrypter.decrypt)
  ], done);
}

module.exports = Credstash;

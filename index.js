const async = require('async');
const decrypter = require('./lib/decrypter');
const encoder = require('./lib/encoder');
const hmac = require('./lib/hmac');
const keys = require('./lib/keys');
const Secrets = require('./lib/secrets');
const xtend = require('xtend');

const defaults = {
  limit: 1
};

function Credstash(config) {
  config = config || {};
  var awsConfig = config.awsConfig || {};

  this.secrets = new Secrets(config.table, awsConfig);

}

Credstash.prototype.get = function(name, options, done) {
  if (typeof options === 'function') {
    done = options;
    options = defaults;
  } else {
    options = xtend(defaults, options);
  }

  return async.waterfall([
    async.apply(this.secrets.getVersions.bind(this.secrets), name, options),
    async.apply(keys.decrypt),
    async.apply(hmac.check),
    async.apply(decrypter.decrypt)
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

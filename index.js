'use strict';

const async = require('async');
const decrypter = require('./lib/decrypter');
const encoder = require('./lib/encoder');
const hmac = require('./lib/hmac');
const Keys = require('./lib/keys');
const Secrets = require('./lib/secrets');
const xtend = require('xtend');
const utils = require('./lib/utils');

const defaults = {
  limit: 1
};

function Credstash(config) {
  config = config || {};
  var awsConfig = config.awsConfig || {};

  this.secrets = new Secrets(config.table, awsConfig);
  this.keys = new Keys(awsConfig);

}

Credstash.prototype.getSecret = function (name, version, context, done) {
  let args = utils.optArgs({version: version, context: context, done: done});
  version = args.version;
  context = args.context;
  done = args.done;

  let fn = this.secrets.getLatestVersion.bind(this.secrets, name);
  if (version) {
    fn = this.secrets.getByVersion.bind(this.secrets, name, version);
  }

  return this.decryptSecrets(fn, context, function (err, secret) {
    if (err) {
      return done(err);
    }

    return done(null, secret[0] || secret)
  });
};

Credstash.prototype.get = function (name, options, done) {
  if (typeof options === 'function') {
    done = options;
    options = defaults;
  } else {
    options = xtend(defaults, options);
  }

  return this.decryptSecrets(this.secrets.getVersions.bind(this.secrets, name, options), null,
    function (err, secrets) {
      if (err) {
        return done(err);
      }

      if (options.limit === 1) {
        return done(null, secrets && secrets[0]);
      }

      done(null, secrets);
    });
};

Credstash.prototype.listSecrets = function (options, done) {
  if (typeof options === 'function') {
    done = options;
    options = {};
  }
  return this.secrets.getAllSecretsAndVersions(options, function (err, res) {
    if (err) {
      return done(err);
    }
    return done(null, res.Items);
  });
};

Credstash.prototype.decryptSecrets = function (getSecrets, context, done) {
  return async.waterfall([
    async.apply(getSecrets),
    async.apply(this.keys.decryptAll.bind(this.keys, context)),
    async.apply(hmac.check),
    async.apply(decrypter.decrypt)
  ], done);
};

module.exports = Credstash;

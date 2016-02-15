const crypto = require('crypto');
const encoder = require('./encoder');

module.exports = {
  check: (stash, done) => {
    var hmac = crypto.createHmac('sha256', stash.hmacPlaintext);
    var contents = encoder.decode(stash.contents);
    hmac.update(contents);

    if (hmac.digest('hex') !== stash.hmac) {
      return done(new Error('Computed HMAC does not match store HMAC'));
    }

    return done(null, stash);
  }
};

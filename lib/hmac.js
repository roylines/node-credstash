const crypto = require('crypto');
const encoder = require('./encoder');

module.exports = {
  check: (stashes, done) => {
    const wrongMacs = stashes.filter(stash => {
      const hmac = crypto.createHmac('sha256', stash.hmacPlaintext);
      const contents = encoder.decode(stash.contents);
      hmac.update(contents);
      return hmac.digest('hex') !== stash.hmac;
    });

    if (wrongMacs.length > 0) {
      return done(new Error('Computed HMAC does not match store HMAC'));
    }

    return done(null, stashes);
  }
};

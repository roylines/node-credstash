const aesjs = require('aes-js');
const encoder = require('./encoder');

module.exports = {
  decrypt: (stash, done) => {
    var key = stash.keyPlaintext;
    var value = encoder.decode(stash.contents);
    var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(1));
    var decryptedBytes = aesCtr.decrypt(value);
    return done(null, decryptedBytes.toString());
  }
};

const aesjs = require('aes-js');
const encoder = require('./encoder');

function decryptedString(stash) {
  const key = stash.keyPlaintext;
  const value = encoder.decode(stash.contents);
  const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(1));
  const decryptedBytes = aesCtr.decrypt(value);
  return aesjs.utils.utf8.fromBytes(decryptedBytes);
}

module.exports = {
  decryptedList: (stashes, done) => {
    const decrypted = stashes.map(stash => {
      return decryptedString(stash);
    });
    return done(null, decrypted);
  },
  decryptedObject: (stashes, done) => {
    const decrypted = stashes.reduce((acc, stash) => {
      acc[stash.name] = decryptedString(stash);
      return acc;
    }, {});
    return done(null, decrypted);
  }
};

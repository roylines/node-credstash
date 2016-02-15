
module.exports = {
  encode: (s) => {
    return new Buffer(s).toString('base64'); 
  },
  decode: (s) => {
    return new Buffer(s, 'base64');
  }
}

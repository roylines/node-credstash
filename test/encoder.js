const encoder = require('../lib/encoder.js');
const should = require('chai').should();

describe('encoder', () => {
  it('should encode correctly', () => {
    encoder.encode('TEST').toString().should.equal('VEVTVA==');
  });
  it('should encode and decode', () => {
    encoder.decode(encoder.encode('TEST')).toString('utf8').should.equal('TEST');
  });
});

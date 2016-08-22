'use strict';

const Credstash = require('../index.js');
const should = require('chai').should();
const AWS = require('aws-sdk-mock');
const awsFunctions = require('./awsFunctions');

describe('credstash', () => {
  beforeEach(() => {
    AWS.restore();
  });

  it('can get secret', (done) => {
    AWS.mock('DynamoDB.DocumentClient', 'query', awsFunctions.mockQuery('credential-store'));
    AWS.mock('KMS', 'decrypt', awsFunctions.mockKMS);
    var credstash = new Credstash();
    return credstash.get('secret', (e, secret) => {
      should.not.exist(e);
      secret.should.equal('magic');
      return done();
    });
  });

  it('can get N versions of a secret', (done) => {
    AWS.mock('DynamoDB.DocumentClient', 'query', awsFunctions.mockQueryWithTake('credential-store'));
    AWS.mock('KMS', 'decrypt', awsFunctions.mockKMS);
    var credstash = new Credstash();
    return credstash.get('secret', { limit: 3 }, (e, secrets) => {
      should.not.exist(e);
      secrets[0].should.equal('magic');
      secrets[1].should.equal('magic');
      secrets[2].should.equal('magic');
      return done();
    });
  });

  it('can get secret from alternative table', (done) => {
    AWS.mock('DynamoDB.DocumentClient', 'query', awsFunctions.mockQuery('another-table'));
    AWS.mock('KMS', 'decrypt', awsFunctions.mockKMS);
    var credstash = new Credstash({
      table: 'another-table'
    });
    return credstash.get('secret', (e, secret) => {
      should.not.exist(e);
      secret.should.equal('magic');
      return done();
    });
  });
  
  it('can handle args out of order', (done) => {
    var context = {key: 'value'};
    AWS.mock('DynamoDB.DocumentClient', 'get', awsFunctions.mockGet('credential-store', 'version'));
    AWS.mock('KMS', 'decrypt', awsFunctions.mockKMSContext(context));
    var credstash = new Credstash();
    return credstash.getSecret('secret', context, 'version', (e, secret) => {
      should.not.exist(e);
      secret.should.equal('magic');
      return done();
    });
  });

  it('can get version X of a secret', (done) => {
    AWS.mock('DynamoDB.DocumentClient', 'get', awsFunctions.mockGet('credential-store', 'version'));
    AWS.mock('KMS', 'decrypt', awsFunctions.mockKMS);
    var credstash = new Credstash();
    return credstash.getSecret('secret', 'version', (e, secret) => {
      should.not.exist(e);
      secret.should.equal('magic');
      return done();
    });
  });
  
  it('can use context for a secret key', (done) => {
    var context = {key: 'value'};
    AWS.mock('DynamoDB.DocumentClient', 'get', awsFunctions.mockGet('credential-store', 'version'));
    AWS.mock('KMS', 'decrypt', awsFunctions.mockKMSContext(context));
    var credstash = new Credstash();
    return credstash.getSecret('secret', 'version', context, (e, secret) => {
      should.not.exist(e);
      secret.should.equal('magic');
      return done();
    });
  });


  it('can get a list from DynamoDB', (done) => {
    var items = Array.from({length: 30}, (v, i) => ({name: i, version: i}));
    AWS.mock('DynamoDB.DocumentClient', 'scan', awsFunctions.pagedQueryOrScan(null, items, {
      ProjectionExpression: '#name, #version'
    }));
    AWS.mock('KMS', 'decrypt', awsFunctions.mockKMS);

    var credstash = new Credstash();

    return credstash.listSecrets((e, res) => {
      should.not.exist(e);
      res.length.should.equal(items.length);
      res.should.eql(items);
      return done();
    });
  });


  it('can page through the list from DynamoDB', (done) => {
    var items = Array.from({length: 30}, (v, i) => ({name: i, version: i}));
    AWS.mock('DynamoDB.DocumentClient', 'scan', awsFunctions.pagedQueryOrScan(null, items, {Limit: 10}));
    AWS.mock('KMS', 'decrypt', awsFunctions.mockKMS);

    var credstash = new Credstash();

    return credstash.listSecrets({limit: 10}, (e, res) => {
      should.not.exist(e);
      res.length.should.equal(items.length);
      res.should.eql(items);
      return done();
    });
  });

});

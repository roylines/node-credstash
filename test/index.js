const Credstash = require('../index.js');
const should = require('chai').should();
const AWS = require('aws-sdk-mock');

describe('credstash', () => {
  beforeEach(() => {
    AWS.restore();
  });

  it('can get secret', (done) => {
    AWS.mock('DynamoDB.DocumentClient', 'query', mockQuery('credential-store'));
    AWS.mock('KMS', 'decrypt', mockKMS);
    var credstash = new Credstash();
    return credstash.get('secret', (e, secret) => {
      should.not.exist(e);
      secret.should.equal('magic');
      return done();
    });
  });

  it('can get N versions of a secret', (done) => {
    AWS.mock('DynamoDB.DocumentClient', 'query', mockQueryWithTake('credential-store'));
    AWS.mock('KMS', 'decrypt', mockKMS);
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
    AWS.mock('DynamoDB.DocumentClient', 'query', mockQuery('another-table'));
    AWS.mock('KMS', 'decrypt', mockKMS);
    var credstash = new Credstash({
      table: 'another-table'
    });
    return credstash.get('secret', (e, secret) => {
      should.not.exist(e);
      secret.should.equal('magic');
      return done();
    });
  });
});

var mockKMS = (params, done) => {
  var ret = {
    Plaintext: new Buffer('KvQ7FPrc2uYXHjW8n+Y63HHCvyRjujeaIZepV/eUkfkz8ZbM9oymmzC69+XLTlbtvRV1MNmo3ngqE+7dJHoDMw==', 'base64')
  };

  return done(null, ret);
};

var mockQuery = (expectedTable) => {
  return (params, done) => {
    params.TableName.should.equal(expectedTable);
    var ret = {
      Items: [{
        key: 'CiBzvX0zBm6hGu0EnbpRJ+eO+HfPOIsG5oq1UDiK+pi/vBLLAQEBAQB4c719MwZuoRrtBJ26USfnjvh3zziLBuaKtVA4ivqYv7wAAACiMIGfBgkqhkiG9w0BBwaggZEwgY4CAQAwgYgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMKNQYv5K9wPp+EvLQAgEQgFsITbvzf75MiY6aeIG2v/OzH2ThW5EJrfgNSekCGXONJSs3R8qkOlxFOfnoISvCXylMwBr+iAZFydgZiSyudPE+qocnYi++aVsv+iV9rR7o+FGQtSWKj2UH9PHm',
        hmac: 'ada335c27410033b16887d083aba629c17ad8f88b7982f331e4f6f8df92c41a9',
        contents:'H2T+k+c='
      }]
    };

    return done(null, ret);
  };
};

var mockQueryWithTake = (expectedTable) => {
  return (params, done) => {
    params.Limit.should.equal(3);
    params.TableName.should.equal(expectedTable);
    var ret = {
      Items: [{
        key: 'CiBzvX0zBm6hGu0EnbpRJ+eO+HfPOIsG5oq1UDiK+pi/vBLLAQEBAQB4c719MwZuoRrtBJ26USfnjvh3zziLBuaKtVA4ivqYv7wAAACiMIGfBgkqhkiG9w0BBwaggZEwgY4CAQAwgYgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMKNQYv5K9wPp+EvLQAgEQgFsITbvzf75MiY6aeIG2v/OzH2ThW5EJrfgNSekCGXONJSs3R8qkOlxFOfnoISvCXylMwBr+iAZFydgZiSyudPE+qocnYi++aVsv+iV9rR7o+FGQtSWKj2UH9PHm',
        hmac: 'ada335c27410033b16887d083aba629c17ad8f88b7982f331e4f6f8df92c41a9',
        contents:'H2T+k+c='
      },{
        key: 'CiBzvX0zBm6hGu0EnbpRJ+eO+HfPOIsG5oq1UDiK+pi/vBLLAQEBAQB4c719MwZuoRrtBJ26USfnjvh3zziLBuaKtVA4ivqYv7wAAACiMIGfBgkqhkiG9w0BBwaggZEwgY4CAQAwgYgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMKNQYv5K9wPp+EvLQAgEQgFsITbvzf75MiY6aeIG2v/OzH2ThW5EJrfgNSekCGXONJSs3R8qkOlxFOfnoISvCXylMwBr+iAZFydgZiSyudPE+qocnYi++aVsv+iV9rR7o+FGQtSWKj2UH9PHm',
        hmac: 'ada335c27410033b16887d083aba629c17ad8f88b7982f331e4f6f8df92c41a9',
        contents:'H2T+k+c='
      },{
        key: 'CiBzvX0zBm6hGu0EnbpRJ+eO+HfPOIsG5oq1UDiK+pi/vBLLAQEBAQB4c719MwZuoRrtBJ26USfnjvh3zziLBuaKtVA4ivqYv7wAAACiMIGfBgkqhkiG9w0BBwaggZEwgY4CAQAwgYgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMKNQYv5K9wPp+EvLQAgEQgFsITbvzf75MiY6aeIG2v/OzH2ThW5EJrfgNSekCGXONJSs3R8qkOlxFOfnoISvCXylMwBr+iAZFydgZiSyudPE+qocnYi++aVsv+iV9rR7o+FGQtSWKj2UH9PHm',
        hmac: 'ada335c27410033b16887d083aba629c17ad8f88b7982f331e4f6f8df92c41a9',
        contents:'H2T+k+c='
      }]
    };

    return done(null, ret);
  };
};

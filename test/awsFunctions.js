'use strict';

const should = require('chai').should();

var kmsDecrypted = {
  Plaintext: new Buffer('KvQ7FPrc2uYXHjW8n+Y63HHCvyRjujeaIZepV/eUkfkz8ZbM9oymmzC69+XLTlbtvRV1MNmo3ngqE+7dJHoDMw==', 'base64')
};


function findKeyIndex(items, keys) {
  let index = items.findIndex(item => {
    let matches = true;

    Object.keys(keys).forEach(key => {
      let value = keys[key];
      matches = matches && item[key] == value;
    });

    return matches;
  });
  return index;
}

function sliceItems(items, params) {
  let limit = params.Limit || items.length;
  let startIndex = 0;

  if (params.ExclusiveStartKey) {
    startIndex = findKeyIndex(items, params.ExclusiveStartKey) + 1;
  }

  let Items = items.slice(startIndex, startIndex + limit);

  let lastIndex = startIndex + limit - 1;
  let LastEvaluatedKey;

  let last = items[lastIndex];
  if (lastIndex < (items.length - 1) && last) {
    LastEvaluatedKey = {name: last.name, version: last.version};
  }

  let Count = Items.length;
  let ScannedCount = Count;

  let results = {LastEvaluatedKey, Items, ScannedCount, Count};
  return results;
}

function compareParams(actual, expected) {
  if (expected.TableName) {
    actual.TableName.should.eql(expected.TableName);
  }
  if (expected.ExpressionAttributeNames) {
    actual.ExpressionAttributeNames.should.eql(expected.ExpressionAttributeNames);
  }
  if (expected.KeyConditionExpression) {
    actual.KeyConditionExpression.should.eql(expected.KeyConditionExpression);
  }

  if (expected.ProjectionExpression) {
    actual.ProjectionExpression.should.eql(expected.ProjectionExpression);
  }

  if (expected.Limit) {
    actual.Limit.should.eql(expected.Limit);
  }

  if (expected.ExpressionAttributeValues) {
    actual.ExpressionAttributeValues.should.eql(expected.ExpressionAttributeValues);
  }
}

module.exports = {
  mockKMS(params, done){
    return done(null, kmsDecrypted);
  },

  mockKMSContext(expectedContext){
    return (params, done) => {
      if (expectedContext) {
        params.EncryptionContext.should.eql(expectedContext);
      }
      return done(null, kmsDecrypted);
    };
  },

  mockGet(expectedTable, expectedVersion){
    return (params, done) => {
      params.TableName.should.equal(expectedTable);
      if (expectedVersion) {
        params.Key.version.should.equal(expectedVersion);
      }
      var ret = {
        Item: {
          key: 'CiBzvX0zBm6hGu0EnbpRJ+eO+HfPOIsG5oq1UDiK+pi/vBLLAQEBAQB4c719MwZuoRrtBJ26USfnjvh3zziLBuaKtVA4ivqYv7wAAACiMIGfBgkqhkiG9w0BBwaggZEwgY4CAQAwgYgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMKNQYv5K9wPp+EvLQAgEQgFsITbvzf75MiY6aeIG2v/OzH2ThW5EJrfgNSekCGXONJSs3R8qkOlxFOfnoISvCXylMwBr+iAZFydgZiSyudPE+qocnYi++aVsv+iV9rR7o+FGQtSWKj2UH9PHm',
          hmac: 'ada335c27410033b16887d083aba629c17ad8f88b7982f331e4f6f8df92c41a9',
          contents: 'H2T+k+c='
        }
      };

      return done(null, ret);
    };
  },

  mockQuery(expectedTable){
    return (params, done) => {
      params.TableName.should.equal(expectedTable);
      var ret = {
        Items: [{
          key: 'CiBzvX0zBm6hGu0EnbpRJ+eO+HfPOIsG5oq1UDiK+pi/vBLLAQEBAQB4c719MwZuoRrtBJ26USfnjvh3zziLBuaKtVA4ivqYv7wAAACiMIGfBgkqhkiG9w0BBwaggZEwgY4CAQAwgYgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMKNQYv5K9wPp+EvLQAgEQgFsITbvzf75MiY6aeIG2v/OzH2ThW5EJrfgNSekCGXONJSs3R8qkOlxFOfnoISvCXylMwBr+iAZFydgZiSyudPE+qocnYi++aVsv+iV9rR7o+FGQtSWKj2UH9PHm',
          hmac: 'ada335c27410033b16887d083aba629c17ad8f88b7982f331e4f6f8df92c41a9',
          contents: 'H2T+k+c='
        }]
      };

      return done(null, ret);
    };
  },

  mockQueryWithTake(expectedTable){
    return (params, done) => {
      params.Limit.should.equal(3);
      params.TableName.should.equal(expectedTable);
      var ret = {
        Items: [{
          key: 'CiBzvX0zBm6hGu0EnbpRJ+eO+HfPOIsG5oq1UDiK+pi/vBLLAQEBAQB4c719MwZuoRrtBJ26USfnjvh3zziLBuaKtVA4ivqYv7wAAACiMIGfBgkqhkiG9w0BBwaggZEwgY4CAQAwgYgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMKNQYv5K9wPp+EvLQAgEQgFsITbvzf75MiY6aeIG2v/OzH2ThW5EJrfgNSekCGXONJSs3R8qkOlxFOfnoISvCXylMwBr+iAZFydgZiSyudPE+qocnYi++aVsv+iV9rR7o+FGQtSWKj2UH9PHm',
          hmac: 'ada335c27410033b16887d083aba629c17ad8f88b7982f331e4f6f8df92c41a9',
          contents: 'H2T+k+c='
        }, {
          key: 'CiBzvX0zBm6hGu0EnbpRJ+eO+HfPOIsG5oq1UDiK+pi/vBLLAQEBAQB4c719MwZuoRrtBJ26USfnjvh3zziLBuaKtVA4ivqYv7wAAACiMIGfBgkqhkiG9w0BBwaggZEwgY4CAQAwgYgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMKNQYv5K9wPp+EvLQAgEQgFsITbvzf75MiY6aeIG2v/OzH2ThW5EJrfgNSekCGXONJSs3R8qkOlxFOfnoISvCXylMwBr+iAZFydgZiSyudPE+qocnYi++aVsv+iV9rR7o+FGQtSWKj2UH9PHm',
          hmac: 'ada335c27410033b16887d083aba629c17ad8f88b7982f331e4f6f8df92c41a9',
          contents: 'H2T+k+c='
        }, {
          key: 'CiBzvX0zBm6hGu0EnbpRJ+eO+HfPOIsG5oq1UDiK+pi/vBLLAQEBAQB4c719MwZuoRrtBJ26USfnjvh3zziLBuaKtVA4ivqYv7wAAACiMIGfBgkqhkiG9w0BBwaggZEwgY4CAQAwgYgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMKNQYv5K9wPp+EvLQAgEQgFsITbvzf75MiY6aeIG2v/OzH2ThW5EJrfgNSekCGXONJSs3R8qkOlxFOfnoISvCXylMwBr+iAZFydgZiSyudPE+qocnYi++aVsv+iV9rR7o+FGQtSWKj2UH9PHm',
          hmac: 'ada335c27410033b16887d083aba629c17ad8f88b7982f331e4f6f8df92c41a9',
          contents: 'H2T+k+c='
        }]
      };

      return done(null, ret);
    };
  },

  pagedQueryOrScan(error, items, expectedParams) {
    return (params, done) => {
      compareParams(params, expectedParams || {});
      let results = sliceItems(items, params);

      done(error, results);
    }
  }
};

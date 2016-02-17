const AWS = require('aws-sdk');
const async = require('async');

function find(table, name, done) {
  var params = {
    TableName: table || 'credential-store',
    ConsistentRead: true,
    Limit: 1,
    ScanIndexForward: false,
    KeyConditions: {
      name: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [{
          S: name
        }]
      }
    }
  };

  return new AWS.DynamoDB().query(params, done);
}

function map(name, data, done) {
  if (!data.Items || data.Items.length != 1) {
    return done(new Error('secret not found: ' + name));
  }

  var item = data.Items[0];

  var stash = {
    key: item.key.S,
    hmac: item.hmac.S,
    contents: item.contents.S
  };

  return done(null, stash);
}

module.exports = {
  get: (table, name, done) => {
    return async.waterfall([
      async.apply(find, table, name),
      async.apply(map, name),
    ], done);
  }
};

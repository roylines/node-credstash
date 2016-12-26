const AWS = require('aws-sdk');
const async = require('async');

if (typeof process.env.AWS_DEFAULT_REGION !== undefined) {
  AWS.config.update({region: process.env.AWS_DEFAULT_REGION});
}

// Blatantly borrowed from https://www.electrictoolbox.com/pad-number-zeroes-javascript/
function pad(number, length) {
  var str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}

function makeVersion(version, padLen = 19) {
  return {
    ComparisonOperator: 'EQ',
    AttributeValueList: [{
      S: pad(version, padLen)
    }]
  };
}

function scan(table, options, done) {
  var params = {
    TableName: table || 'credential-store',
    ConsistentRead: true,
    ScanFilter: {}
  };

  if (options.version !== undefined) {
      params.ScanFilter.version = makeVersion(options.version);
  }

  return new AWS.DynamoDB().scan(params, done);
}

function find(table, name, options, done) {
  var params = {
    TableName: table || 'credential-store',
    ConsistentRead: true,
    Limit: options.limit,
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

  if (options.version !== undefined) {
    params.KeyConditions.version = makeVersion(options.version);
  }

  return new AWS.DynamoDB().query(params, done);
}

function map(name, data, done) {
  if (!data.Items || data.Items.length === 0) {
    return done(new Error('secret not found: ' + name));
  }

  var result = data.Items.map(item => ({
    name: item.name.S,
    key: item.key.S,
    hmac: item.hmac.S,
    contents: item.contents.S
  }));

  return done(null, result);
}

module.exports = {
  get: (table, name, options, done) => {
    return async.waterfall([
      async.apply(find, table, name, options),
      async.apply(map, name),
    ], done);
  },
  list: (table, options, done) => {
    return async.waterfall([
      async.apply(scan, table, options),
      async.apply(map, 'all secrets'),
    ], done);
  }
};

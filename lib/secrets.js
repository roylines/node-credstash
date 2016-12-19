const AWS = require('aws-sdk');
const async = require('async');
const PAD_LEN = 19;
if (typeof process.env.AWS_DEFAULT_REGION !== 'undefined') {
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

function find(table, name, options, done) {
  var params = {
    TableName: table || 'credential-store',
    ConsistentRead: true,
    Limit: options.limit,
    ScanIndexForward: false,
  };
  if (typeof options.version !== 'undefined') {
    params.KeyConditions = {
      name: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [{
          S: name
        }]
      },
      version: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [{
          S: pad(options.version, PAD_LEN)
        }]
      }
    };
  }
  else {
    params.KeyConditions = {
      name: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [{
          S: name
        }]
      }
    };
  }

  return new AWS.DynamoDB().query(params, done);
}

function map(name, data, done) {
  if (!data.Items || data.Items.length === 0) {
    return done(new Error('secret not found: ' + name));
  }

  var result = data.Items.map(item => ({
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
  }
};

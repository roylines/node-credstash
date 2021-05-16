const async = require('async');

// Blatantly borrowed from https://www.electrictoolbox.com/pad-number-zeroes-javascript/
function pad(number, length) {
  var str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}

function makeVersion(version) {
  return {
    ComparisonOperator: 'EQ',
    AttributeValueList: [{
      S: pad(version, 19)
    }]
  };
}

function scan(AWS, options, done) {
  var params = {
    TableName: options.table || 'credential-store',
    ConsistentRead: true,
    ScanFilter: {}
  };

  if (options.version != undefined) {
      params.ScanFilter.version = makeVersion(options.version);
  }

  return new AWS.DynamoDB().scan(params, done);
}

function find(AWS, name, options, done) {
  var params = {
    TableName: options.table || 'credential-store',
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

  if (options.version != undefined) {
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
    hmac: ('S' in item.hmac) ? item.hmac.S : item.hmac.B.toString('utf8'),
    contents: item.contents.S
  }));

  return done(null, result);
}

module.exports = {
  get: (AWS, name, options, done) => {
    return async.waterfall([
      async.apply(find, AWS, name, options),
      async.apply(map, name),
    ], done);
  },
  list: (AWS, options, done) => {
    return async.waterfall([
      async.apply(scan, AWS, options),
      async.apply(map, 'all secrets'),
    ], done);
  }
};

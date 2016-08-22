'use strict';

const AWS = require('aws-sdk');
const async = require('async');
const https = require('https');

function createAllVersionsQuery(table, name) {
  if (!name) {
    throw new Error('Name must be defined');
  }
  let params = {
    TableName: table,
    ConsistentRead: true,
    ScanIndexForward: false,
    KeyConditionExpression: `#name = :name`,
    ExpressionAttributeNames: {
      '#name': 'name'
    },
    ExpressionAttributeValues: {
      ':name': name
    }
  };
  return params;
}

function Secrets(table, awsOptions) {
  this.table = table  || 'credential-store';
  const agent = new https.Agent({
    rejectUnauthorized: true,
    keepAlive: true,
    ciphers: 'ALL',
    secureProtocol: 'TLSv1_method'
  });

  awsOptions = awsOptions || {};
  awsOptions.httpOptions = {agent: agent};

  this.docClient = new AWS.DynamoDB.DocumentClient(awsOptions);
}


Secrets.prototype.getVersions = function(name, options, done) {
  options = options || {};
  var params = createAllVersionsQuery(this.table, name);
  params.Limit = options.limit;
  return this.docClient.query(params, function(err, res) {
    if (err) {
      return done(err);
    }
    if (!res.Items.length) {
      return done(new Error('secret not found: ' + name));
    }

    return done(undefined, res.Items);
  });
};


module.exports = Secrets;

'use strict';

const AWS = require('aws-sdk');
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

function combineResults(curr, next) {
  if (!curr) {
    return next;
  } else if (!next) {
    return curr;
  }

  let combined = Object.assign({}, next, {
    Items: curr.Items.concat(next.Items),
    Count: curr.Count + next.Count
  });

  return combined;
}

function pageResults(fn, params, curr, done) {
  if (!done) {
    done = curr;
    curr = null;
  }
  params = Object.assign({}, params);

  if (curr) {
    params.ExclusiveStartKey = curr.LastEvaluatedKey;
  }
  return fn(params, (err, next) => {
    if (err) {
      return done(err);
    }
      let combined = combineResults(curr, next);
      if (next.LastEvaluatedKey) {
        return pageResults(fn, params, combined, done);
      }
      return done(null, combined);
    })
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


Secrets.prototype.getLatestVersion = function(name, done) {
  let params = createAllVersionsQuery(this.table, name);
  params.Limit = 1;
  return this.docClient.query(params, function(err, res){
    if (err) {
      return done(err);
    }
    if (!res.Items.length) {
      return done(new Error('secret not found: ' + name));
    }
    return done(undefined, res.Items[0]);
  });
};

Secrets.prototype.getByVersion = function(name, version, done) {
  let params = {
    TableName: this.table,
    Key: {name, version}
  };

  return this.docClient.get(params, function(err, res) {
    if (err) {
      return done(err);
    }

    if (!res.Item) {
      return done(new Error('secret not found: ' + name + ' (' + version + ')'));
    }

    return done(undefined, res.Item);
  });
};

Secrets.prototype.getAllSecretsAndVersions = function(options, done) {
  let params = {
    TableName: this.table,
    ProjectionExpression: '#name, #version',
    Limit: options.limit,
    ExpressionAttributeNames: {
      '#name': 'name',
      '#version': 'version'
    }
  };
  return pageResults(this.docClient.scan.bind(this.docClient), params, done);
};

module.exports = Secrets;

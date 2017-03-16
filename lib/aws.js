const AWS = require('aws-sdk');

if (typeof process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI !== 'undefined') {
  AWS.config.credentials = new AWS.ECSCredentials({
    httpOptions: { timeout: 5000 },
    maxRetries: 10,
    retryDelayOptions: { base: 200 }
  });
}

if (typeof process.env.AWS_DEFAULT_REGION !== 'undefined') {
  AWS.config.update({region: process.env.AWS_DEFAULT_REGION});
}

module.exports = AWS;

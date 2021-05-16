const AWS = require('aws-sdk');

function getAWS(options) {
  if (options && options.region) {
    AWS.config.update({region: options.region});
  }
  return AWS;
}

module.exports = {
  getAWS,
};

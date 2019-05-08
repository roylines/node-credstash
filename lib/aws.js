const AWS = require('aws-sdk');

function getAWS(options) {
  AWS.config.update({region: options.region});
  return AWS;
}

module.exports = {
  getAWS,
};

const should = require('chai').should();

describe('AWS', () => {
  const env = Object.assign({}, process.env);
  process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI = 'https://fake-uri';

  afterEach(() => {
    process.env = env;
  });

  it('can work with ecs credentials', (done) => {
    const AWS = require('../lib/aws.js');
    AWS.config.credentials.should.be.an.instanceOf(AWS.ECSCredentials);
    done();
  });
});

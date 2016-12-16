# node-credstash
[![Circle CI](https://circleci.com/gh/roylines/node-credstash.svg?style=svg)](https://circleci.com/gh/roylines/node-credstash)

Node.js module for reading [credstash](https://github.com/fugue/credstash) secrets without needing snakes

```js
const Credstash = require('../index.js');

var credstash = new Credstash();
credstash.get('secret', (e, secret) => {
  console.log('do not share the secret', secret);
});

credstash.list((e, secret) => {
  console.log('do not share the secret', secret);
});
```

## Installation
Ensure you have [AWS credentials configured](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html).
The credentials should be set up as a [secret reader](https://github.com/fugue/credstash#secret-reader)

```bash
$ npm install credstash
```

## What is credstash?
[Credstash](https://github.com/fugue/credstash) is a little utility for managing credentials in the cloud

## Who this module for?
This module is for environments where you are using [credstash](https://github.com/fugue/credstash) to store secrets,
and you want to read secrets within node without installing python.
The module could be used within your node module to retrieve, for instance, database connection credentials from credstash.

## Retrieving all keys and values

```js
credstash.list(function (e, secrets) { ... });
```

Returns an object containing all the keys and values.

```js
const Credstash = require('../index.js');

var credstash = new Credstash();
return credstash.list((e, secrets) => {
  // secrets == {key1: 'value1', key2: 'value2'}
  console.log('do not share all the secrets', secrets);
});
```

## Retrieving the last N versions of a secret
Credstash support [versioning of secrets](https://github.com/fugue/credstash#versioning-secrets) which allows to easily rotate secrets.

By default node-credstash will return the latest (most recent version of a secret).
You can also retrieve the latest N versions of a secret as follows:

```js
const Credstash = require('../index.js');

var credstash = new Credstash();
return credstash.get('secret', {limit: 3}, (e, secrets) => {
  console.log('this is the last version', secrets[0]);
  console.log('this is the second-last', secrets[1]);
  console.log('this is the third-last', secrets[2]);
});
```


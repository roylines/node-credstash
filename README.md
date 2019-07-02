# node-credstash
[![Circle CI](https://circleci.com/gh/roylines/node-credstash.svg?style=svg)](https://circleci.com/gh/roylines/node-credstash)

Node.js module for reading [credstash](https://github.com/fugue/credstash) secrets without needing snakes

```js
const Credstash = require('credstash');
const credstash = new Credstash();

// .get method for one key (table query)
credstash.get('secret', (e, secret) => {
  console.log('do not share the secret', secret);
});

// .list method for multiple keys (table scan)
credstash.list((e, secrets) => {
  console.log('do not share the secrets', secrets);
});
```

## Installation
Ensure you have [AWS credentials configured](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html).
The credentials should be set up as a [secret reader](https://github.com/fugue/credstash#secret-reader)

```bash
$ npm install credstash
```

```brew
$ brew install credstash
```

### Actions

#### Authenticate with AWS

#### List of items
```
$ credstash -r {region-name} list
```

#### Store new item
```
$ credstash -r {region-name} put {new-item-name} {new-item-contents}
```

###### List of regions
- eu-west-1

###### Useful Credstash Arguments:
-r - REGION

## What is credstash?
[Credstash](https://github.com/fugue/credstash) is a little utility for managing credentials in the cloud

## Who this module for?
This module is for environments where you are using [credstash](https://github.com/fugue/credstash) to store secrets,
and you want to read secrets within node without installing python.
The module could be used within your node module to retrieve, for instance, database connection credentials from credstash.

## Retrieving the last N versions of a secret
Credstash support [versioning of secrets](https://github.com/fugue/credstash#versioning-secrets) which allows to easily rotate secrets.

By default node-credstash will return the latest (most recent version of a secret).
You can also retrieve the latest N versions of a secret as follows:

```js
const Credstash = require('credstash');
const credstash = new Credstash();

credstash.get('secret', {limit: 3}, (e, secrets) => {
  console.log('this is the last version', secrets[0]);
  console.log('this is the second-last', secrets[1]);
  console.log('this is the third-last', secrets[2]);
});
```

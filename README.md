# node-credstash
[![Circle CI](https://circleci.com/gh/roylines/node-credstash.svg?style=svg)](https://circleci.com/gh/roylines/node-credstash)

Node.js module for reading [credstash](https://github.com/fugue/credstash) secrets without needing snakes

```js
const Credstash = require('../index.js');

var credstash = new Credstash();
return credstash.get('secret', (e, secret) => {
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
and you want to read secrets within node without installing python. The module can be used
within you microservice to retrieve, for instance, database connection credentials.


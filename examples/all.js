const Credstash = require('../index.js');
var credstash = new Credstash();

return credstash.list((e, secrets) => {
  if (e) {
    console.error('error listing secrets', e);
  }
  return credstash.get('test', (e, secret) => {
    if (e) {
      console.error('error getting secret', e);
    }
    console.log('do not share the secret', secret);
  });
});

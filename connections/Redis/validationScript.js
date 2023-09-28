// Documentation
// https://www.npmjs.com/package/redis

const { createClient } = require('redis');

var result = { status: SUCCESS, message: 'Success' };

let url;
if (connectionParameters.password)
  url = `redis://${connectionParameters.username}:${connectionParameters.password}@${connectionParameters.host}:${connectionParameters.port}`;
else url = `redis://${connectionParameters.host}:${connectionParameters.port}`;

const client = createClient({ url });

try {
  await client.connect();
  // Returns PONG
  await client.ping();

  await client.get('somekey');
} catch (e) {
  result.status = ERROR;
  result.message = e.message;
}

await client.quit();

return result;

// Demonstrates running single action and restoring it

const executeAction = require('./utils/action_execute.js');
const restore = require('./utils/action_restore.js');

const workflowVariables = {};

const action = 'apachekafka_send_message';

const actionParameters = {
  connection: { host: process.env.KAFKA_HOST, port: process.env.KAFKA_PORT },
  keyedMessage: false,
  key: 'key',
  message: 'message',
  topic: 'some-topic',
};

async function test() {
  const connectionParameters = { host: 'docker.local', port: 6379 };

  const { createClient } = require('redis');

  var result = { status: 'SUCCESS', message: 'Success' };

  let url;
  if (!connectionParameters.password)
    url = `redis://${connectionParameters.username}:${connectionParameters.password}@${connectionParameters.host}:${connectionParameters.port}`;
  else url = `redis://${connectionParameters.host}:${connectionParameters.port}`;

  const client = createClient({ url });

  try {
    await client.connect();
    // Returns PONG
    await client.ping();

    await client.get('somekey');
  } catch (e) {
    result.status = 'ERROR';
    result.message = e.message;
  }

  await client.quit();
}

test();

//executeAction(action, actionParameters, workflowVariables);

//restore(action);

// Demonstrates running single action and restoring it

const executeAction = require('./utils/action_execute.js');
const restore = require('./utils/action_restore.js');

const workflowVariables = {};

const action = 'apachekafka_send_message';

const actionParameters = {
  connection: { host: process.env.KAFKA_HOST, port: process.env.KAFKA_PORT },
  keyedMessage: true,
  key: 'key',
  message: 'message',
  topic: 'some-topic',
};

executeAction(action, actionParameters, workflowVariables);

//restore(action);

const executeAction = require('./utils/action_execute.js');
const restore = require('./utils/action_restore.js');

const actionParameters = {
  connection: { host: process.env.KAFKA_HOST, port: process.env.KAFKA_PORT },
  keyedMessage: false,
  key: undefined,
  message: 'message',
  partition: 2,
  attributes: 0,
  partitionKey: 'Test',
  topic: 'some-topic',
};

const action = 'apachekafka_send_message';

executeAction(action, actionParameters);

//restore(action);

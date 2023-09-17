// Demonstrates running single action and restoring it

const executeAction = require('./utils/action_execute.js');
const restore = require('./utils/action_restore.js');

const workflowVariables = {};

const connection = {
  protocol: process.env.MQTT_PROTOCOL,
  host: process.env.MQTT_HOST,
  port: process.env.MQTT_PORT,
  login: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
};

const actionParameters = {
  connection,
  topic: 'stat/sm3/RESULT',
  message: 'message',
};

const action = 'mqtt_send_message';

executeAction(action, actionParameters, workflowVariables);

restore(action);

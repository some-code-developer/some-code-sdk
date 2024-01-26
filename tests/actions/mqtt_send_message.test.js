require('dotenv').config();
const os = require('node:os');
const executeAction = require('../../utils/action_execute.js');

const action = 'mqtt_send_message';

const { SUCCESS, ERROR } = require('../../utils/consts.js');
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
  message: 'message 1235',
};

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
  });
});

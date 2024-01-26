require('dotenv').config();
const os = require('node:os');
const executeAction = require('../../utils/action_execute.js');

const action = 'rabbbitmq_send_message';

const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};

const connection = {
  host: process.env.RABBITMQ_HOST,
  port: process.env.RABBITMQ_PORT,
  user: process.env.RABBITMQ_USER,
  password: process.env.RABBITMQ_PASS,
  authMechanism: 'AMQPLAIN',
  vhost: process.env.RABBITMQ_VHOST,
};

const actionParameters = {
  connection,
  routingKey: 'message-queue',
  message: 'message',
};

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
  });
});

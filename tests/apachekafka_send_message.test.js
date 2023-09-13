require('dotenv').config();
const os = require('node:os');
const executeAction = require('../utils/action_execute.js');

const action = 'apachekafka_send_message';

const { SUCCESS, ERROR } = require('../utils/consts.js');

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

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(SUCCESS);
  });
});

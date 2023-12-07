require('dotenv').config();
const fs = require('fs');
const executeAction = require('../../utils/action_execute.js');

const action = 'smtp';

const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};

const connection = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  password: process.env.SMTP_PASSWORD,
  secure: false,
};

describe(`${action} Tests`, () => {
  test('Testing Success - no attachments', async () => {
    const actionParameters = {
      connection,
      message: 'test',
      sender: 'sender@some-code.com',
      from: 'from@some-code.com',
      replyTo: 'replyTo@some-code.com',
      to: 'to@some-code.com',
      cc: 'cc@some-code.com',
      bcc: 'bcc@some-code.com',
      subject: 'Subject line',
    };

    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Success - with attachments', async () => {
    const actionParameters = {
      connection,
      message: 'test',
      sender: 'sender@some-code.com',
      from: 'from@some-code.com',
      replyTo: 'replyTo@some-code.com',
      to: 'to@some-code.com',
      cc: 'cc@some-code.com',
      bcc: 'bcc@some-code.com',
      subject: 'Subject line',
      attachments: '["./play-ground/test.txt"]',
    };

    const result = await executeAction(action, actionParameters, 'debug');
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - missing everything', async () => {
    const actionParameters = {};
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });
});

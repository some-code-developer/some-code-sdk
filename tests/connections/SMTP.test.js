require('dotenv').config();
const fs = require('fs');
const executeConnectionValidationScript = require('../../utils/connection_test.js');

const connectionToTest = 'SMTP';

const { SUCCESS, ERROR } = require('../../utils/consts.js');

describe(`${connectionToTest} Tests`, () => {
  test('Testing Success', async () => {
    const connectionParameters = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
      secure: false,
    };

    const result = await executeConnectionValidationScript(connectionToTest, connectionParameters);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - wrong connection', async () => {
    const connectionParameters = {
      host: undefined,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
      secure: false,
    };
    const result = await executeConnectionValidationScript(connectionToTest, connectionParameters);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - empty connection', async () => {
    const connectionParameters = {};
    const result = await executeConnectionValidationScript(connectionToTest, connectionParameters);
    // assert
    expect(result).toBe(ERROR);
  });
});

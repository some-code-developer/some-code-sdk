require('dotenv').config();
const fs = require('fs');
const executeConnectionValidationScript = require('../../utils/connection_test.js');

const connectionToTest = 'Database';

const { SUCCESS, ERROR } = require('../../utils/consts.js');

describe(`${connectionToTest} Tests`, () => {
  test('Testing Success', async () => {
    const connectionParameters = {
      type: process.env.SQL_CONNECTION_TYPE,
      host: process.env.SQL_DB_HOST,
      port: process.env.SQL_DB_PORT,
      username: process.env.SQL_DB_USER,
      password: process.env.SQL_DB_PASS,
      database: process.env.SQL_DB_NAME,
      instanceName: process.env.SQL_DB_INSTANCE,
      secure: false,
    };

    const result = await executeConnectionValidationScript(connectionToTest, connectionParameters);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - wrong connection', async () => {
    const connectionParameters = {
      type: process.env.SQL_CONNECTION_TYPE,
      host: process.env.SQL_DB_HOST,
      port: process.env.SQL_DB_PORT,
      username: process.env.SQL_DB_USER,
      password: process.env.SQL_DB_PASS,
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

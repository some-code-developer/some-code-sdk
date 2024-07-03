require('dotenv').config();
const fs = require('fs');
const executeAction = require('../../utils/action_execute.js');

const action = 'sql_count';

const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};

const connection = {
  type: process.env.SQL_CONNECTION_TYPE,
  host: process.env.SQL_DB_HOST,
  port: process.env.SQL_DB_PORT,
  username: process.env.SQL_DB_USER,
  password: process.env.SQL_DB_PASS,
  database: process.env.SQL_DB_NAME,
  instanceName: process.env.SQL_DB_INSTANCE,
  secure: false,
};

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = {
      connection,
      sql: 'select count(*) from city',
    };

    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
    expect(typeof actionParameters.count).toBe('number');
  });

  test('Testing Failure - wrong sql', async () => {
    const actionParameters = {
      connection,
      sql: 'select sum(x) from city',
    };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing connection', async () => {
    const actionParameters = {
      sql: 'select sum(x) from city',
    };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing sql', async () => {
    const actionParameters = {
      connection,
    };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing everything', async () => {
    const actionParameters = {};
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });
});

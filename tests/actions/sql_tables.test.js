require('dotenv').config();
const fs = require('fs');
const executeAction = require('../../utils/action_execute.js');

const action = 'sql_tables';

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
    };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
    expect(typeof actionParameters.tables).toBe('object');
  });

  test('Testing Failure - missing connection', async () => {
    const actionParameters = {};
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });
});

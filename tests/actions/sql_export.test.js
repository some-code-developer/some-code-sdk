require('dotenv').config();
const fs = require('fs');
const executeAction = require('../../utils/action_execute.js');

const action = 'sql_export';

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

const file = './play-ground/test-sql-export.txt';
const sql = 'select * from city';

afterEach(() => {
  if (fs.existsSync(file)) fs.unlinkSync(file);
});

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = {
      connection,
      sql,
      file,
    };

    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - wrong sql', async () => {
    const actionParameters = {
      connection,
      sql: 'select * from cityxxx',
      file,
    };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing connection', async () => {
    const actionParameters = { sql, file };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing sql', async () => {
    const actionParameters = { connection, file };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing file', async () => {
    const actionParameters = { connection, sql };
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

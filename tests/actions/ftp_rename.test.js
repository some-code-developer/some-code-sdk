require('dotenv').config();
const path = require('path');
const executeAction = require('../../utils/action_execute.js');
const ftp = require('basic-ftp');

const action = 'ftp_rename';

const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};

const connection = {
  host: process.env.FTP_HOST,
  port: process.env.FTP_PORT,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  secure: false,
};

const folder = '/play-ground/rename';
const sourceFile = './play-ground/test.txt';
const source = '/play-ground/rename/test.txt';
const target = '/play-ground/rename/test1.txt';

beforeAll(async () => {
  const client = new ftp.Client();
  await client.access(connection);
  await client.ensureDir(folder);
  await client.uploadFrom(sourceFile, path.basename(sourceFile));
  client.close();
});

afterAll(async () => {
  const client = new ftp.Client();
  await client.access(connection);
  await client.removeDir(folder);
  client.close();
});

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = {
      connection,
      source,
      target,
    };

    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - wrong source', async () => {
    const actionParameters = {
      connection,
      source: null,
      target,
    };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - wrong target', async () => {
    const actionParameters = {
      connection,
      source,
      target: null,
    };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing connection', async () => {
    const actionParameters = { source, target };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing source', async () => {
    const actionParameters = { connection, target };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing target', async () => {
    const actionParameters = { connection, source };
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

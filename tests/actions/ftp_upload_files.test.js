require('dotenv').config();
const path = require('path');
const executeAction = require('../../utils/action_execute.js');
const ftp = require('basic-ftp');

const action = 'ftp_upload_files';

const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};

const connection = {
  host: process.env.FTP_HOST,
  port: process.env.FTP_PORT,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  secure: false,
};

const folder = '/play-ground/upload-files';
const file = './play-ground/test.txt';

beforeAll(async () => {
  const client = new ftp.Client();
  await client.access(connection);
  await client.ensureDir(folder);
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
      file,
      folder,
    };

    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - wrong file', async () => {
    const actionParameters = {
      connection,
      file: null,
      folder,
    };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - wrong folder', async () => {
    const actionParameters = {
      connection,
      file,
      folder: null,
    };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing connection', async () => {
    const actionParameters = { folder, file };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing folder', async () => {
    const actionParameters = { connection, file };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing file', async () => {
    const actionParameters = { connection, folder };
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

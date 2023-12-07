require('dotenv').config();
const path = require('path');
const executeAction = require('../../utils/action_execute.js');
const ftp = require('basic-ftp');

const action = 'ftp_upload_folder';

const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};

const connection = {
  host: process.env.FTP_HOST,
  port: process.env.FTP_PORT,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  secure: false,
};

const localFolder = './play-ground/';
const remoteFolder = '/play-ground/upload-folder';

beforeAll(async () => {
  const client = new ftp.Client();
  await client.access(connection);
  await client.ensureDir(remoteFolder);
  client.close();
});

afterAll(async () => {
  const client = new ftp.Client();
  await client.access(connection);
  await client.removeDir(remoteFolder);
  client.close();
});

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = {
      connection,
      localFolder,
      remoteFolder,
    };

    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - wrong localFolder', async () => {
    const actionParameters = {
      connection,
      localFolder: null,
      remoteFolder,
    };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - wrong remoteFolder', async () => {
    const actionParameters = {
      connection,
      localFolder,
      remoteFolder: null,
    };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing connection', async () => {
    const actionParameters = { localFolder, remoteFolder };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing localFolder', async () => {
    const actionParameters = { connection, remoteFolder };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing remoteFolder', async () => {
    const actionParameters = { connection, localFolder };
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

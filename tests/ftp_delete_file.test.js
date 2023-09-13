require('dotenv').config();
const path = require('path');
const executeAction = require('../utils/action_execute.js');
const ftp = require('basic-ftp');

const action = 'ftp_delete_file';

const { SUCCESS, ERROR } = require('../utils/consts.js');

const connection = {
  host: process.env.FTP_HOST,
  port: process.env.FTP_PORT,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  secure: false,
};

const folder = '/play-ground/delete-file';
const sourceFile = './play-ground/test.txt';
const file = '/play-ground/delete-file/test.txt';

beforeAll(async () => {
  const client = new ftp.Client();
  await client.access(connection);
  await client.ensureDir(folder);
  await client.uploadFrom(sourceFile, path.basename(sourceFile));
  client.close();
});

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = {
      connection,
      file,
    };

    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - wrong file', async () => {
    const actionParameters = {
      connection,
      file: null,
    };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing connection', async () => {
    const actionParameters = { file };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing file', async () => {
    const actionParameters = { connection };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing everything', async () => {
    const actionParameters = {};
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });
});

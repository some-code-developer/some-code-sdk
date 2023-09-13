require('dotenv').config();
const fs = require('fs');
const executeAction = require('../utils/action_execute.js');

const action = 'ftp_download_files';

const { SUCCESS, ERROR } = require('../utils/consts.js');

const connection = {
  host: process.env.FTP_HOST,
  port: process.env.FTP_PORT,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  secure: false,
};

const file = './play-ground/test.txt';
const folder = './play-ground/download-files';

afterAll(async () => {
  if (fs.existsSync(folder)) fs.rmdirSync(folder, { recursive: true });
});

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = {
      connection,
      folder,
      file,
    };

    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - wrong file', async () => {
    const actionParameters = {
      connection,
      folder,
      file: null,
    };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - wrong folder', async () => {
    const actionParameters = {
      connection,
      folder: null,
      file,
    };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing connection', async () => {
    const actionParameters = { folder };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing file', async () => {
    const actionParameters = { connection, folder };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing folder', async () => {
    const actionParameters = { connection, file };
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

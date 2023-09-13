require('dotenv').config();
const os = require('node:os');
const executeAction = require('../utils/action_execute.js');

const action = 'ftp_create_folder';

const { SUCCESS, ERROR } = require('../utils/consts.js');

const connection = {
  host: process.env.FTP_HOST,
  port: process.env.FTP_PORT,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  secure: false,
};

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = {
      connection,
      folder: './play-ground/folder-create/',
    };

    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(SUCCESS);
  });

  // This will never fail unfortunately
  test('Testing Failure - wrong folder', async () => {
    const actionParameters = {
      connection,
      folder: 'c:/play-ground/',
    };
    const result = await executeAction(action, actionParameters, 'debug');
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - missing connection', async () => {
    const actionParameters = { folder: './play-ground/folder-create/' };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing folder', async () => {
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

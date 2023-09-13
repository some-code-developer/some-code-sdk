const fs = require('fs');
const executeAction = require('../utils/action_execute.js');

const action = 'file_md5';

const { SUCCESS, ERROR } = require('../utils/consts.js');

const file = './play-ground/test.txt';

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = { file };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - wrong file', async () => {
    const actionParameters = { file: './play-ground/test.txt.wrong' };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing file', async () => {
    const actionParameters = {};
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });
});

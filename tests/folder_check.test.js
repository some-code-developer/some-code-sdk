const os = require('node:os');
const executeAction = require('../utils/action_execute.js');

const action = 'folder_check';

const { SUCCESS, ERROR } = require('../utils/consts.js');

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = { folder: './play-ground' };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - wrong folder', async () => {
    const actionParameters = { folder: './play-ground/test.txt.wrong' };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing folder', async () => {
    const actionParameters = {};
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });
});

const fs = require('fs');
const executeAction = require('../utils/action_execute.js');

const action = 'folder_create';

const { SUCCESS, ERROR } = require('../utils/consts.js');

const folder = './play-ground/folder-create/';

afterEach(() => {
  if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true });
});

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = { folder };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - missing folder', async () => {
    const actionParameters = {};
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });
});

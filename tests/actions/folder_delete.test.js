const fs = require('fs');
const executeAction = require('../../utils/action_execute.js');

const action = 'folder_delete';

const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};

const folder = './play-ground/folder-delete/';

beforeEach(() => {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
});

afterEach(() => {
  if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true });
});

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = { folder, recursive: true };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - missing folder', async () => {
    const actionParameters = {};
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });
});

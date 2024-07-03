const fs = require('fs');
const executeAction = require('../../utils/action_execute.js');

const action = 'file_copy';

const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};

const target = './play-ground/file_copy';
const source = './play-ground/test.txt';

afterEach(() => {
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true });
});

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = { source, target };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - wrong file', async () => {
    const actionParameters = { source: './play-ground/test.txt.wrong', target };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing file', async () => {
    const actionParameters = {};
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });
});

require('dotenv').config();
const fs = require('fs');
const executeAction = require('../../utils/action_execute.js');

const action = 'variable_save';
const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = { test: 'data' };

const variable = 'test';
const file = './play-ground/test-variable-save.txt';

afterEach(() => {
  if (fs.existsSync(file)) fs.unlinkSync(file);
});

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = { file, variable };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - missing file', async () => {
    const actionParameters = { variable };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing variable', async () => {
    const actionParameters = { file };
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

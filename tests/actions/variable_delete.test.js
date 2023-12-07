require('dotenv').config();
const fs = require('fs');
const executeAction = require('../../utils/action_execute.js');

const action = 'variable_delete';
const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = { test: 'data', test2: 'data' };
const actionParameters = { variable: 'test' };

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
    expect(workflowVariables.test).toBe(undefined);
    expect(workflowVariables.test2).toBe('data');
  });
});

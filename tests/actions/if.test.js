require('dotenv').config();
const path = require('path');
const executeAction = require('../../utils/action_execute.js');

const action = 'if';

const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = { Expression: true };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure', async () => {
    const actionParameters = { Expression: false };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });
});

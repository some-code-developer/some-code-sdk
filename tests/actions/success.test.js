const os = require('node:os');
const fs = require('fs');
const executeAction = require('../../utils/action_execute.js');

const action = 'success';

const { SUCCESS } = require('../../utils/consts.js');
const workflowVariables = {};

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = {};
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
  });
});

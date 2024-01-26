require('dotenv').config();
const fs = require('fs');
const executeAction = require('../../utils/action_execute.js');

const action = 'json2xml';
const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = {
      json: { data: 1 },
    };

    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
    expect(typeof actionParameters.xml).toBe('string');
  });

  test('Testing Failure - missing everything', async () => {
    const actionParameters = {};
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });
});

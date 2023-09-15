require('dotenv').config();
const path = require('path');
const executeAction = require('../../utils/action_execute.js');

const action = 'http_request';

const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};

const url = 'https://www.etl-tools.com/';

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = {
      url,
    };

    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - wrong url', async () => {
    const actionParameters = { url: null };
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

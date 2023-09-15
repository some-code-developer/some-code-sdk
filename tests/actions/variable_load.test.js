require('dotenv').config();
const fs = require('fs');
const executeAction = require('../../utils/action_execute.js');

const action = 'variable_load';
const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};

const file = './play-ground/test.txt';
const variable = 'test';

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = { file, variable };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
    expect(typeof workflowVariables.test).toBe('string');
  });

  test('Testing Failure - wrong file', async () => {
    const actionParameters = { file: './play-ground/test.txt.wrong',variable };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing file', async () => {
    const actionParameters = {variable};
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

const os = require('node:os');
const fs = require('fs');
const executeAction = require('../../utils/action_execute.js');

const action = 'encrypt';

const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};
const source = './play-ground/test.txt';
const target = './play-ground/test.txt.enc';

afterEach(() => {
  if (fs.existsSync(target)) fs.unlinkSync(target);
});

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = { source, target, password: 'password' };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
  });
  test('Testing Failure - Missing source', async () => {
    const actionParameters = { target, password: 'password' };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });
  test('Testing Failure - Missing target', async () => {
    const actionParameters = { source, password: 'password' };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });
  test('Testing Failure - Missing password', async () => {
    const actionParameters = { source, target };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });
});

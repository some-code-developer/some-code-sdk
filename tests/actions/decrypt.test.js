const os = require('node:os');
const fs = require('fs');
const executeAction = require('../../utils/action_execute.js');

const action = 'decrypt';

const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};
const source = './play-ground/test.txt.enc1';
const target = './play-ground/test.txt2';

beforeAll(async () => {
  const action = 'encrypt';
  const source = './play-ground/test.txt';
  const target = './play-ground/test.txt.enc1';
  const actionParameters = { source, target, password: 'password' };
  await executeAction(action, actionParameters, workflowVariables);
});

afterEach(() => {
  if (fs.existsSync(target)) fs.unlinkSync(target);
});

afterAll(async () => {
  if (fs.existsSync(source)) fs.unlinkSync(source);
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

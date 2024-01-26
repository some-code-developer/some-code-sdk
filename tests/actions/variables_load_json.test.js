require('dotenv').config();
const fs = require('fs');
const executeAction = require('../../utils/action_execute.js');

const action = 'variables_load_json';
const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};

const data = { test: 'data' };
const file = './play-ground/test-variables-load-json.json';

beforeAll(() => {
  fs.writeFileSync(file, JSON.stringify(data, null, 4));
});

afterAll(() => {
  if (fs.existsSync(file)) fs.unlinkSync(file);
});

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = { file };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
    expect(workflowVariables.test).toBe('data');
  });

  test('Testing Failure - missing everything', async () => {
    const actionParameters = {};
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });
});

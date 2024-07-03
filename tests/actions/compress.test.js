const fs = require('fs');
const executeAction = require('../../utils/action_execute.js');

const action = 'compress';

const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};
const file = './play-ground/compress/compress.7z';
const dir = './play-ground/compress/';

afterEach(() => {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
});

describe(`${action} Tests`, () => {
  test('Testing Success - No Password', async () => {
    const actionParameters = { file, path: './play-ground/test.txt' };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
  });
  test('Testing Success - Password', async () => {
    const actionParameters = { file, path: './play-ground/test.txt', password: 'test' };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
  });
  test('Testing Failure', async () => {
    const actionParameters = { file, path: './play-ground/tes1.txt' };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });
});

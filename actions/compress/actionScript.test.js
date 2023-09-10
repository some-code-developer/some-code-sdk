const os = require('node:os');
const fs = require('fs');
const executeAction = require('./../../utils/action_execute.js');

const action = 'compress';

const { SUCCESS, ERROR } = require('./../../utils/consts.js');

const file = './play-ground/compress.7z';

afterEach(() => {
  if (fs.existsSync(file)) fs.unlinkSync(file);
});

describe(`${action} Tests`, () => {
  test('Testing Success - No Password', async () => {
    const actionParameters = { file, path: './play-ground/test.txt' };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(SUCCESS);
  });
  test('Testing Success - Password', async () => {
    const actionParameters = { file, path: './play-ground/test.txt', password: 'test' };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(SUCCESS);
  });
  test('Testing Failure', async () => {
    const actionParameters = { file, path: './play-ground/tes1.txt' };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });
});

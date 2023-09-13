const fs = require('fs');
const executeAction = require('../utils/action_execute.js');

const action = 'folder_copy';

const { SUCCESS, ERROR } = require('../utils/consts.js');

const sourceFile = './play-ground/test.txt';
const targetFile = './play-ground/folder-copy-source/test.txt';
const source = './play-ground/folder-copy-source/';
const target = './play-ground/folder-copy-target/';

beforeEach(() => {
  if (!fs.existsSync(source)) fs.mkdirSync(source, { recursive: true });
  fs.copyFileSync(sourceFile, targetFile);
});

afterEach(() => {
  if (fs.existsSync(source)) fs.rmSync(source, { recursive: true });
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true });
});

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = { source, target };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - missing source', async () => {
    const actionParameters = { target };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing target', async () => {
    const actionParameters = { source };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });
});

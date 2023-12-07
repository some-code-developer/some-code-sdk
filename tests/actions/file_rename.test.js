const fs = require('fs');
const executeAction = require('../../utils/action_execute.js');

const action = 'file_rename';

const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};

const sourceFile = './play-ground/test.txt';
const targetDir = './play-ground/test-rename/';

const source = './play-ground/test-rename/test.txt';
const target = './play-ground/test-rename/test2.txt';

beforeEach(() => {
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(sourceFile, source);
});

afterEach(() => {
  if (fs.existsSync(targetDir)) fs.rmSync(targetDir, { recursive: true });
});

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = { source, target };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - wrong file', async () => {
    const actionParameters = { source: './play-ground/test.txt.wrong', target };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing source', async () => {
    const actionParameters = { target };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing target', async () => {
    const actionParameters = { source };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - empty actionParameters', async () => {
    const actionParameters = {};
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });
});

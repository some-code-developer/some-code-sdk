const os = require('node:os');
const fs = require('fs');
const sevenBin = require('7zip-bin');
const Seven = require('node-7z');
const pathTo7zip = sevenBin.path7za;

const executeAction = require('./../../utils/action_execute.js');

const action = 'decompress';

const { SUCCESS, ERROR } = require('./../../utils/consts.js');

const file1 = './play-ground/compress-test1.7z';
const file2 = './play-ground/compress-test2.7z';
const path = './play-ground/test/';

function compress(file, path, password) {
  const p = new Promise((resolve, reject) => {
    const parameters = {
      $bin: pathTo7zip,
      recursive: true,
    };

    if (password) parameters.password = password;

    const sevenProcess = Seven.add(file, path, parameters);

    sevenProcess.on('error', (err) => {
      reject(err);
    });

    sevenProcess.on('end', (info) => {
      resolve();
    });
  });

  return p;
}

beforeAll(async () => {
  if (fs.existsSync(file1)) fs.unlinkSync(file1);
  await compress(file1, './play-ground/test.txt');
  if (fs.existsSync(file2)) fs.unlinkSync(file2);
  await compress(file2, './play-ground/test.txt', 'test');
});

afterAll(() => {
  if (fs.existsSync(file1)) fs.unlinkSync(file1);
  if (fs.existsSync(file2)) fs.unlinkSync(file2);
});

afterEach(() => {
  if (fs.existsSync(path)) fs.rmdirSync(path, { recursive: true });
});

describe(`${action} Tests`, () => {
  test('Testing Success - No Password', async () => {
    const actionParameters = { file: file1, path };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(SUCCESS);
  });
  test('Testing Success - Password', async () => {
    const actionParameters = { file: file2, path, password: 'test' };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(SUCCESS);
  });
  test('Testing Failure', async () => {
    const actionParameters = { file: 'abc', path };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - No Password', async () => {
    const actionParameters = { file: file2, path };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - Wrong Password', async () => {
    const actionParameters = { file: file2, path, password: 'test122' };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });
});

const os = require('node:os');
const executeAction = require('../utils/action_execute.js');

const action = 'execute_shell_command';
let parameters =  '-c 2 localhost'

if (os.platform() === 'win32') 
    parameters = 'localhost'

const { SUCCESS, ERROR } = require('../utils/consts.js');

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = { file: 'ping', parameters, timeout: 10000 };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(SUCCESS);
  });

  test('Testing Failure - no parameters', async () => {
    const actionParameters = { file: 'ping' };
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(ERROR);
  });
});

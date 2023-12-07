const os = require('node:os');
const executeAction = require('../../utils/action_execute.js');

const action = 'check_disk_usage';

const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};
const actionParametersSuccess = {};
const actionParametersFailure = {};

if (os.platform() === 'win32') {
  actionParametersSuccess.DrivePath = 'C:';
  actionParametersFailure.DrivePath = '/mnt/drive1';
} else {
  actionParametersSuccess.DrivePath = '/mnt/drive1';
  actionParametersFailure.DrivePath = 'C:';
}

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const result = await executeAction(action, actionParametersSuccess);
    // assert
    expect(result).toBe(SUCCESS);
  });
  test('Testing Failure', async () => {
    const result = await executeAction(action, actionParametersFailure);
    // assert
    expect(result).toBe(ERROR);
  });
});

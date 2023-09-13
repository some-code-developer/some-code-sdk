const os = require('node:os');
const fs = require('fs');
const executeAction = require('../utils/action_execute.js');

const action = 'success';

const { SUCCESS } = require('../utils/consts.js');

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = {};
    const result = await executeAction(action, actionParameters);
    // assert
    expect(result).toBe(SUCCESS);
  });
});

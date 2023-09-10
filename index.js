const executeAction = require('./utils/action_execute.js');
const restore = require('./utils/action_restore.js');

const actionParameters = {
  file: './play-ground/compress-test2.7z',
  path: './play-ground/test/',
};

const action = 'execute_shell_command';

// executeAction(action, actionParameters);

restore(action);

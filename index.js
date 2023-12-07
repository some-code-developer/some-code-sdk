// Demonstrates running single action and restoring it

const executeAction = require('./utils/action_execute.js');
const restore = require('./utils/action_restore.js');

const workflowVariables = {};

const action = 'google_indexing';

const actionParameters = {
  connection: { email: process.env.GOOGLE_IDEXING_EMAIL, password: process.env.GOOGLE_IDEXING_KEY.split('\\n').join('\n') },
  url: 'https://www.etl-tools.com/table/articles/',
  type: 'URL_UPDATED',
};

executeAction(action, actionParameters, workflowVariables);

// Demonstrates running single action and restoring it

const executeAction = require("./utils/action_execute.js");
const restore = require("./utils/action_restore.js");
const { actionParameters, workflowVariables, workflowParameters } = require("./actions/sql_import/devParameters.js");

const action = "sql_import";

executeAction(action, actionParameters, workflowVariables);

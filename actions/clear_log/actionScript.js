const { clearLogs } = require("./utils");
actionParameters.ExecutionResult = SUCCESS;
try {
  await clearLogs(workflowCode);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}
return actionParameters.ExecutionResult;

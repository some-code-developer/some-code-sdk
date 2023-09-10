const { clearLogs } = require("./utils");
actionParameters.ExecutionResult = SUCCESS;
try {
  await clearLogs(workflowCode);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;

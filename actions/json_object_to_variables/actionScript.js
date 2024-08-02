actionParameters.ExecutionResult = SUCCESS;
try {
  const parameters = JSON.parse(actionParameters.json);
  for (const key in parameters) {
    workflowVariables[key] = parameters[key];
  }
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}
return actionParameters.ExecutionResult;

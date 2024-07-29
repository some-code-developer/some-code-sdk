actionParameters.ExecutionResult = SUCCESS;
try {
  let found = false;
  for (const key in workflowVariables) {
    if (key === actionParameters.variable) {
      delete workflowVariables[key];
      found = true;
    }
  }

  if (!found) logger.debug(`Variable ${actionParameters.variable} was not found`);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}
return actionParameters.ExecutionResult;

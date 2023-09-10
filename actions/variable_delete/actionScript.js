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
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;

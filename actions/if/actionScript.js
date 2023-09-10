if (actionParameters.Expression === true || actionParameters.Expression === "true") actionParameters.ExecutionResult = SUCCESS;
else actionParameters.ExecutionResult = ERROR;
return actionParameters.ExecutionResult;

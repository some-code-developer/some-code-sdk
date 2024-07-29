const fs = require("fs");
const readline = require("readline");

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require("./utils");

actionParameters.ExecutionResult = SUCCESS;
try {
  const file = cleanPath(actionParameters.file);

  actionParameters.data = [];

  const rl = readline.createInterface({
    input: fs.createReadStream(l),
    crlfDelay: Infinity,
  });

  // Reading data line by line
  for await (const line of rl) actionParameters.data.push(line);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}
return actionParameters.ExecutionResult;

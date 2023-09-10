const path = require("node:path");
const fs = require("fs");

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require("./utils");

function copyFolderSync(from, to) {
  if (fs.existsSync(from)) {
    fs.mkdirSync(to, { recursive: true });
    fs.readdirSync(from).forEach((element) => {
      if (fs.lstatSync(path.join(from, element)).isFile()) {
        fs.copyFileSync(path.join(from, element), path.join(to, element));
      } else {
        copyFolderSync(path.join(from, element), path.join(to, element));
      }
    });
  }
}
actionParameters.ExecutionResult = SUCCESS;
try {
  copyFolderSync(cleanPath(actionParameters.source), cleanPath(actionParameters.target));
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;

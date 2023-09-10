const path = require("node:path");
const fs = require("fs");
const fsp = require("fs").promises;

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
  const source = cleanPath(actionParameters.source);
  const target = cleanPath(actionParameters.target);
  copyFolderSync(source, target);
  await fsp.rm(source, { recursive: true });
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;

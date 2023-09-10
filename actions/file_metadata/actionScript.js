const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require("./utils");

const dateFormat = "YYYY-MM-DD HH:mm:ss.SSS";

actionParameters.ExecutionResult = SUCCESS;
try {
  const fileName = cleanPath(actionParameters.file);
  const directory = path.dirname(fileName);
  const stats = fs.statSync(fileName);

  const metaData = {
    fileName,
    directory,
    isFile: stats.isFile(),
    isDirectory: stats.isDirectory(),
    isSymbolicLink: stats.isSymbolicLink(),
    size: stats.size, // 1024000 //= 1MB
    accessed: dayjs(stats.atime).format(dateFormat),
    modified: dayjs(stats.mtime).format(dateFormat),
    changed: dayjs(stats.ctime).format(dateFormat),
    created: dayjs(stats.birthtime).format(dateFormat),
  };
  actionParameters.metaData = metaData;
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;

const checkDiskSpace = require('check-disk-space').default;
actionParameters.ExecutionResult = SUCCESS;
try {
  diskSpace = await checkDiskSpace(actionParameters.DrivePath);
  diskSpace.size = diskSpace.size / 1024 / 1024;
  diskSpace.free = diskSpace.free / 1024 / 1024;
  diskSpace.usage = diskSpace.size - diskSpace.free;
  actionParameters.Size = diskSpace.size;
  actionParameters.Free = diskSpace.free;
  actionParameters.Usage = diskSpace.usage;
  logger.debug(JSON.stringify(diskSpace, null, 4));
  if (diskSpace.free < actionParameters.FreeSpace) throw new Error(`Free: ${diskSpace.free} <  ${actionParameters.FreeSpace}`);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}
return actionParameters.ExecutionResult;

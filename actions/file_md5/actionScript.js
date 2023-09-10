const fs = require("fs");
const path = require("path");
const { createHash } = require("node:crypto");

async function hashFile(path, algo = "md5") {
  const hashFunc = createHash(algo); // you can also sha256, sha512 etc

  const contentStream = fs.createReadStream(path);
  const updateDone = new Promise((resolve, reject) => {
    contentStream.on("data", (data) => hashFunc.update(data));
    contentStream.on("close", resolve);
    contentStream.on("error", reject);
  });

  await updateDone;
  return hashFunc.digest("hex"); // will return hash, formatted to HEX
}

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require("./utils");

actionParameters.ExecutionResult = SUCCESS;
try {
  const file = cleanPath(actionParameters.file);
  if (fs.existsSync(file)) stepExecutionInfo.md5 = await hashFile(file);
  else throw new Error(`File: ${file} does not exists`);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;

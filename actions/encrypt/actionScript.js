// Nodejs encryption of buffers
const crypto = require("crypto");
const fs = require("fs");
const Buffer = require("node:buffer").Buffer;

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require("./utils");

actionParameters.ExecutionResult = SUCCESS;

try {
  const algorithm = "aes-256-ctr";

  const IV_LENGTH = 16;

  const sourceFile = cleanPath(actionParameters.source);
  const targetFile = cleanPath(actionParameters.target);

  function encrypt(data) {
    const ENCRYPTION_KEY = crypto.scryptSync(actionParameters.password, "salt", 32);
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, "hex"), iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  }

  const encryptedData = encrypt(fs.readFileSync(sourceFile));

  fs.writeFileSync(targetFile, encryptedData);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;

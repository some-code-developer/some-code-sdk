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

  function decrypt(data) {
    const ENCRYPTION_KEY = crypto.scryptSync(actionParameters.password, "salt", 32);
    let textParts = data.split(":");
    let iv = Buffer.from(textParts.shift(), "hex");
    let encryptedText = Buffer.from(textParts.join(":"), "hex");
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, "hex"), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted;
  }

  const decryptedData = decrypt(fs.readFileSync(sourceFile, "utf8"));

  fs.writeFileSync(targetFile, decryptedData);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}
return actionParameters.ExecutionResult;

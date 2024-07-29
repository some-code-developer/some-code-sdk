const fetch = require('node-fetch');
const fs = require('fs');

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require('./utils');

actionParameters.ExecutionResult = SUCCESS;

// Telegram API endpoint for sending documents
const apiUrl = `https://api.telegram.org/bot${actionParameters.connection.password}/sendPhoto`;

try {

        const fileName = cleanPath(actionParameters.file);

        // Read the file
        const fileStream = fs.createReadStream(fileName);

        // Create form data to send the file
        const formData = new FormData();
        formData.append('chat_id', actionParameters.chatId);
        formData.append('photo', fileStream);

        // Make a POST request to Telegram API
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

  if (response.status !== 200) throw new Error(`Failed to send photo to Telegram: ${response.status} ${response.statusText}`);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}

return actionParameters.ExecutionResult;

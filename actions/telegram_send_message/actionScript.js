const fetch = require('node-fetch');

actionParameters.ExecutionResult = SUCCESS;

// Telegram API endpoint for sending messages
const apiUrl = `https://api.telegram.org/bot${actionParameters.connection.password}/sendMessage`;

// Prepare the message payload
const messagePayload = {
  chat_id: actionParameters.chatId,
  text: actionParameters.message,
};

try {
  // Send the message using fetch
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messagePayload),
  });

  if (response.status !== 200) throw new Error(`Failed to send message to Telegram: ${response.status} ${response.statusText}`);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}

return actionParameters.ExecutionResult;

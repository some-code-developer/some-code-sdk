const mqtt = require('mqtt');
const process = require('node:process');

// Documentation
// https://www.npmjs.com/package/mqtt

actionParameters.ExecutionResult = SUCCESS;

function sendMessage() {
  const p = new Promise((resolve, reject) => {
    const CREATED_BY = 'Some Code MQTT Action';

    const connectionOptions = {
      username: actionParameters.connection.login,
      password: actionParameters.connection.password,
      clientId: `${CREATED_BY} - ${process.version}`,
    };

    const url = `${actionParameters.connection.protocol}${actionParameters.connection.host}:${actionParameters.connection.port}`;

    const onConnect = async () => {
      logger.debug(`MQTT connected: ${url}`);

      await mqttClient.publishAsync(actionParameters.topic, actionParameters.message, {
        qos: 0,
        retain: false,
      });
      logger.debug(`MQTT Message Sent`);
      mqttClient.end();
      resolve();
    };

    const onError = (error) => {
      mqttClient.end();
      reject(error);
    };

    mqttClient = mqtt.connect(url, connectionOptions);
    mqttClient.on('connect', onConnect);
    mqttClient.on('error', onError);
  });
  return p;
}

try {
  await sendMessage();
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}

return actionParameters.ExecutionResult;

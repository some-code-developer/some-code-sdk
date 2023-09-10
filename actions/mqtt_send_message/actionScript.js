const mqtt = require("mqtt");

// Documentation
// https://www.npmjs.com/package/mqtt

actionParameters.ExecutionResult = SUCCESS;

function sendMessage() {
  const p = new Promise((resolve, reject) => {
    const CREATED_BY = "Some Code RabbitMQ Action";

    const connectionOptions = {
      host: actionParameters.connection.host,
      port: actionParameters.connection.port,
      login: actionParameters.connection.login,
      password: actionParameters.connection.password,
      authMechanism: "AMQPLAIN",
      vhost: actionParameters.connection.vhost,
      ssl: {
        enabled: actionParameters.connection.sslEnabled,
        keyFile: actionParameters.connection.keyFile,
        certFile: actionParameters.connection.certFile,
        caFile: actionParameters.connection.caFile,
        rejectUnauthorized: true,
      },
      clientProperties: {
        applicationName: CREATED_BY,
        product: CREATED_BY,
        platform: `${CREATED_BY} - ${process.version}`,
      },
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

    mqttClient = mqtt.connect(url, options);
    mqttClient.on("connect", onConnect);
    mqttClient.on("error", onError);
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

const { setTimeout } = require('timers/promises');
const amqp = require('amqp');
const process = require('node:process');
const product = 'Some Code RabbitMQ  Action';

// TO DO
// Investigate switching to more modern library (amqplib)
// Extend functionality

// Documentation
// https://www.npmjs.com/package/amqp

actionParameters.ExecutionResult = SUCCESS;

const sendMessage = async () => {
  const p = new Promise((resolve, reject) => {
    const connectionOptions = {
      host: actionParameters.connection.host,
      port: Number(actionParameters.connection.port),
      login: actionParameters.connection.user,
      password: actionParameters.connection.password,
      authMechanism: 'AMQPLAIN',
      vhost: actionParameters.connection.vhost,
      ssl: {
        enabled: actionParameters.connection.sslEnabled == 'true',
        keyFile: actionParameters.connection.keyFile,
        certFile: actionParameters.connection.certFile,
        caFile: actionParameters.connection.caFile,
        rejectUnauthorized: true,
      },
      clientProperties: { applicationName: product, product, platform: `${product} - ${process.version}` },
    };

    const onError = (err) => {
      RabbitMQClient.disconnect();
      reject(err);
    };

    const onReady = async () => {
      logger.debug(`RabbitMQ connected`);
      // Connecting to default exchange
      const exchange = RabbitMQClient.exchange();

      exchange.on('open', async (err, result) => {
        if (err) {
          RabbitMQClient.disconnect();
          return reject(err);
        }

        // actionParameters.routingKey - queue

        exchange.publish(actionParameters.routingKey, actionParameters.message, (err, result) => {
          // called if the exchange is in confirm mode, the value sent will be true or false,
          // this is the presence of a error so true,
          // means an error occurred and false, means the publish was successful

          if (err) {
            RabbitMQClient.disconnect();
            return reject(err);
          }
        });

        // Making sure that the message is actually send, will refactor code later
        await setTimeout(1000);

        RabbitMQClient.disconnect();
        resolve();
      });
    };

    RabbitMQClient = amqp.createConnection(connectionOptions, { reconnect: false });
    RabbitMQClient.on('error', onError);
    RabbitMQClient.on('ready', onReady);
  });

  return p;
};

try {
  await sendMessage();
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}

return actionParameters.ExecutionResult;

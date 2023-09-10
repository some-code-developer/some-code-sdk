const typeorm = require("typeorm");
var result = { status: SUCCESS, message: "Success" };
try {
  // Documentation
  // https://typeorm.io/

  const connection = {
    name: "test",
    type: connectionParameters.type,
    host: connectionParameters.host,
    port: Number(connectionParameters.port),
    username: connectionParameters.username,
    password: connectionParameters.password,
    database: connectionParameters.database,
    options: {
      instanceName: connectionParameters.instanceName,
      encrypt: false,
    },
  };

  const dataSource = new typeorm.DataSource(connection);

  // Testing connection
  await dataSource.initialize();

  await dataSource.destroy();
} catch (e) {
  result.status = ERROR;
  result.message = e.message;
}

return result;

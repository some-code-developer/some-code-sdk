/* eslint no-undef: "error" */
/* eslint-env node */

const os = require("os");
const typeorm = require("typeorm");

function getConnection() {
  return {
    name: "default",
    type: process.env.CONNECTION_TYPE,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    options: {
      instanceName: process.env.DB_INSTANCE,
      encrypt: false,
    },
    entities: [`${__dirname}/models/*.js`],
  };
}

const dataSource = new typeorm.DataSource(getConnection());

module.exports = dataSource;

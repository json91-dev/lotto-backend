const CONFIG = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  host: process.env.HOST,
  dialect: 'mysql',
};

module.exports = CONFIG;

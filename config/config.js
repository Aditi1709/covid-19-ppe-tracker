module.exports = {
  development: {
    username: 'trackppe',
    password: 'trackppe',
    database: 'trackppe',
    host: 'localhost',
    dialect: 'postgres',
    // Use a different storage. Default: none
    seederStorage: 'json', // or 'sequelize' to store in database 
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:"
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
    dialect: 'postgres',
  }
};
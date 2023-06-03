require('dotenv/config');

module.exports = {
  PORT: Number(process.env.PORT) || 8080,
  DB: {
    USER: process.env.USER,
    PSW: process.env.PSW,
    DB_NAME: process.env.DB_NAME,
    sql: {
      host: process.env.DB_URL,
      dialect: 'postgres',
      // logging: false,
      pool: {
        max: 5,
        min: 0,
      },
      define: {
        timestamps: false,
      },
    },
  },
};

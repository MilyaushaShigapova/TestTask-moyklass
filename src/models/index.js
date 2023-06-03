const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const basename = path.basename(__filename);
const config = require('../config/env.config');
// const { Sequelize, DataTypes } = require('sequelize');

const db = {};

const sequelize = new Sequelize(
  config.DB.DB_NAME,
  config.DB.USER,
  config.DB.PSW,
  config.DB.sql
);

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
// sequelize.sync();

module.exports = db;

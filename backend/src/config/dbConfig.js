const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('sistema_entregas', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
    logging: false
});

module.exports = sequelize;
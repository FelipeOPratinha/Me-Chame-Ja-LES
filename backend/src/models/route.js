const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Route = sequelize.define('trajeto', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: "trajeto_id"
    },

    order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "trajeto_ordem"
    },

    deliveryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "entrega_id"
    },

    addressId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "endereco_id"
    }
}, {
    timestamps: false,
    freezeTableName: true
});

module.exports = Route;

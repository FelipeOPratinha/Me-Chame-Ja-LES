const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const DeliveryItem = sequelize.define('item_entrega', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: "item_entrega_id"
    },

    name: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "item_entrega_nome"
    },

    weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: "item_entrega_pesagem"
    },

    quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "item_entrega_quantidade"
    },

    remarks: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "item_entrega_observacoes"
    },

    deliveryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "entrega_id"
    }
}, {
    timestamps: false,
    freezeTableName: true
});

module.exports = DeliveryItem;

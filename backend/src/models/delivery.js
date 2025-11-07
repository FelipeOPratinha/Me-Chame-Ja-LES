const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Delivery = sequelize.define('entrega', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: "entrega_id"
    },

    value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: "entrega_valor"
    },

    status: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "entrega_status"
    },

    description: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "entrega_descricao"
    },

    categoryType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "entrega_tipo_categoria"
    },

    transportType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "entrega_tipo_transporte"
    },

    scheduledTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "entrega_data_agendada"
    },

    completedTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "entrega_data_finalizacao"
    },

    vehicleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "veiculo_id"
    },

    driverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "motorista_id"
    },

    requesterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "solicitante_id"
    }
}, {
    timestamps: false,
    freezeTableName: true
});

module.exports = Delivery;

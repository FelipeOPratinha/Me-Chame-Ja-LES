const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Vehicle = sequelize.define('veiculo', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: "veiculo_id"
    },

    type: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "veiculo_tipo"
    },

    year: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "veiculo_ano"
    },

    licensePlate: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "veiculo_placa"
    },

    manufacturer: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "veiculo_marca"
    },

    model: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "veiculo_modelo"
    },

    capacity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: "veiculo_capacidade"
    },

    transportsAnimals: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
        field: "veiculo_transporte_animal"
    },

    transportsMaterials: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
        field: "veiculo_transporte_material_construcao"
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "usuario_id"
    }
}, {
    timestamps: false,
    freezeTableName: true
});

module.exports = Vehicle;

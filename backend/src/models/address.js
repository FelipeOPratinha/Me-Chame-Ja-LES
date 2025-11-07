const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Address = sequelize.define('endereco', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: "endereco_id"
    },

    street: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "endereco_logradouro"
    },

    number: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "endereco_numero"
    },

    unit: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "endereco_complemento"
    },

    neighborhood: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "endereco_bairro"
    },

    city: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "endereco_cidade"
    },

    state: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "endereco_estado"
    },

    cep: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "endereco_cep"
    },

    latitude: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "endereco_latitude"
    },

    longitude: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "endereco_longitude"
    }
}, {
    timestamps: false,
    freezeTableName: true
});

module.exports = Address;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const User = sequelize.define('usuario', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: "usuario_id"
    },

    type: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "usuario_tipo"
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "usuario_nome"
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "usuario_email"
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "usuario_senha"
    },

    cellphone: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "usuario_telefone"
    },

    createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        field: "usuario_data_criacao"
    },

    loyaltyPoints: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: "usuario_pontos_fidelidade"
    }
}, {
    timestamps: false,
    freezeTableName: true
});

module.exports = User;

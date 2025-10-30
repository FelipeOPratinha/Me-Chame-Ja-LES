const UserDAO = require('../../daos/UserDAO');

class ValidateVehicleStrategy {
    static async execute(data) {
        try {
            if (data.type && typeof data.type !== 'string') {
                throw new Error('O campo "Tipo de Veículo" deve conter um valor válido.');
            }

            if (data.year) {
                const year = Number(data.year);
                if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
                    throw new Error('O campo "Ano" deve conter um ano válido.');
                }
            }

            if (data.licensePlate && typeof data.licensePlate !== 'string') {
                throw new Error('O campo "Placa" deve conter uma string.');
            }

            if (data.manufacturer && typeof data.manufacturer !== 'string') {
                throw new Error('O campo "Marca" deve conter uma string.');
            }

            if (data.model && typeof data.model !== 'string') {
                throw new Error('O campo "Modelo" deve conter uma string.');
            }

            if (data.capacity && (typeof data.capacity !== 'number' || data.capacity <= 0)) {
                throw new Error('O campo "Capacidade (kg)" deve ser um número positivo.');
            }

            if (data.transportsAnimals && ![0, 1, true, false].includes(data.transportsAnimals)) {
                throw new Error('O campo "Transporte de Animais" deve conter um valor válido.');
            }

            if (data.transportsMaterials && ![0, 1, true, false].includes(data.transportsMaterials)) {
                throw new Error('O campo "Transporte de Materiais" deve conter um valor válido.');
            }

            const userId = Number(data.userId);
            if (isNaN(userId) || !Number.isInteger(userId) || !(await UserDAO.findOne({ id: userId }))) {
                throw new Error('O campo "ID do usuário" deve conter um número válido.');
            }
        } catch (error) {
            throw error.message;
        }
    }
}

module.exports = ValidateVehicleStrategy;

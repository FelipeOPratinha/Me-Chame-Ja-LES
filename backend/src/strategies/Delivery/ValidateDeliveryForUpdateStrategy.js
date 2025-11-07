const UserDAO = require('../../daos/UserDAO');
const VehicleDAO = require('../../daos/VehicleDAO');

class ValidateDeliveryStrategyForUpdate {
    static async execute(data) {
        try {
            if (data.value) {
                const value = Number(data.value);
                if (isNaN(value) || value < 0) {
                    throw new Error('O campo "Valor" deve conter um número positivo.');
                }
            }

            if (data.status && typeof data.status !== 'string') {
                throw new Error('O campo "Status" deve conter um valor válido.');
            }

            if (data.description && typeof data.description !== 'string') {
                throw new Error('O campo "Descrição" deve conter um valor válido.');
            }

            if (data.categoryType && typeof data.categoryType !== 'string') {
                throw new Error('O campo "Tipo da Categortia" deve conter um valor válido.');
            }

            if (data.transportType && typeof data.transportType !== 'string') {
                throw new Error('O campo "Tipo do Transporte" deve conter um valor válido.');
            }

            if (data.scheduledTime && isNaN(Date.parse(data.scheduledTime))) {
                throw new Error('O campo "Horário agendado" deve conter uma data válida.');
            }

            if (data.completedTime && isNaN(Date.parse(data.completedTime))) {
                throw new Error('O campo "Horário concluído" deve conter uma data válida.');
            }

            if (data.vehicleId) {
                const vehicleId = Number(data.vehicleId);
                if (isNaN(vehicleId) || !Number.isInteger(vehicleId) || !(await VehicleDAO.findOne({ id: vehicleId }))) {
                    throw new Error('O campo "Veículo" deve conter um ID válido.');
                }
            }

            if (data.driverId) {
                const driverId = Number(data.driverId);
                if (isNaN(driverId) || !Number.isInteger(driverId) || !(await UserDAO.findOne({ id: driverId }))) {
                    throw new Error('O campo "Motorista" deve conter o ID de um usuário válido.');
                }
            }

            if (data.requesterId) {
                const requesterId = Number(data.requesterId);
                if (isNaN(requesterId) || !Number.isInteger(requesterId) || !(await UserDAO.findOne({ id: requesterId }))) {
                    throw new Error('O campo "Solicitante" deve conter o ID de um usuário válido.');
                }
            }

        } catch (error) {
            throw error.message;
        }
    }
}

module.exports = ValidateDeliveryStrategyForUpdate;

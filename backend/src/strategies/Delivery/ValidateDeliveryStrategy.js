const UserDAO = require('../../daos/UserDAO');
const VehicleDAO = require('../../daos/VehicleDAO');

class ValidateDeliveryStrategy {
    static async execute(data) {
        const delivery = data.delivery;
        try {
            if (delivery.value) {
                const value = Number(delivery.value);
                if (isNaN(value) || value < 0) {
                    throw new Error('O campo "Valor" deve conter um número positivo.');
                }
            }

            if (delivery.status && typeof delivery.status !== 'string') {
                throw new Error('O campo "Status" deve conter um valor válido.');
            }

            if (delivery.description && typeof delivery.description !== 'string') {
                throw new Error('O campo "Descrição" deve conter um valor válido.');
            }

            if (delivery.categoryType && typeof delivery.categoryType !== 'string') {
                throw new Error('O campo "Tipo da Categortia" deve conter um valor válido.');
            }

            if (delivery.transportType && typeof delivery.transportType !== 'string') {
                throw new Error('O campo "Tipo do Transporte" deve conter um valor válido.');
            }

            if (delivery.scheduledTime && isNaN(Date.parse(delivery.scheduledTime))) {
                throw new Error('O campo "Horário agendado" deve conter uma data válida.');
            }

            if (delivery.completedTime && isNaN(Date.parse(delivery.completedTime))) {
                throw new Error('O campo "Horário concluído" deve conter uma data válida.');
            }

            if (delivery.vehicleId) {
                const vehicleId = Number(delivery.vehicleId);
                if (isNaN(vehicleId) || !Number.isInteger(vehicleId) || !(await VehicleDAO.findOne({ id: vehicleId }))) {
                    throw new Error('O campo "Veículo" deve conter um ID válido.');
                }
            }

            if (delivery.driverId) {
                const driverId = Number(delivery.driverId);
                if (isNaN(driverId) || !Number.isInteger(driverId) || !(await UserDAO.findOne({ id: driverId }))) {
                    throw new Error('O campo "Motorista" deve conter o ID de um usuário válido.');
                }
            }

            if (delivery.requesterId) {
                const requesterId = Number(delivery.requesterId);
                if (isNaN(requesterId) || !Number.isInteger(requesterId) || !(await UserDAO.findOne({ id: requesterId }))) {
                    throw new Error('O campo "Solicitante" deve conter o ID de um usuário válido.');
                }
            }

        } catch (error) {
            throw error.message;
        }

        if (data.routes) {
            try {
                for (const route of data.routes) {
                    const order = Number(route.order);
                    if (isNaN(order) || order < 0) {
                        throw new Error('Ordem do Trajeto" deve conter um ano válido.');
                    }

                    const address = route.address;
                    if (address.street && typeof address.street !== 'string') {
                        throw new Error('O campo "Logradouro" deve conter um valor válido.');
                    }

                    if (address.number && typeof address.number !== 'string') {
                        throw new Error('O campo "Número" deve conter um valor válido.');
                    }

                    if (address.unit && typeof address.unit !== 'string') {
                        throw new Error('O campo "Complemento" deve conter um valor válido.');
                    }

                    if (address.neighborhood && typeof address.neighborhood !== 'string') {
                        throw new Error('O campo "Bairro" deve conter um valor válido.');
                    }

                    if (address.city && typeof address.city !== 'string') {
                        throw new Error('O campo "Cidade" deve conter um valor válido.');
                    }

                    if (address.state && typeof address.state !== 'string') {
                        throw new Error('O campo "Estado" deve conter um valor válido.');
                    }

                    if (address.cep && typeof address.cep !== 'string') {
                        throw new Error('O campo "CEP" deve conter um valor válido.');
                    }

                    if (address.latitude && typeof address.latitude !== 'number') {
                        throw new Error('O campo "Latitude" deve conter um valor válido.');
                    }

                    if (address.longitude && typeof address.longitude !== 'number') {
                        throw new Error('O campo "Longitude" deve conter um valor válido.');
                    }
                }
            } catch (error) {
                throw error.message;
            }
        }

        if (data.deliveryItems) {
            try {
                for (const deliveryItem of data.deliveryItems) {
                    if (deliveryItem.name && typeof deliveryItem.name !== 'string') {
                        throw new Error('O campo "Nome" deve conter um valor válido.');
                    }

                    if (deliveryItem.weight && (typeof deliveryItem.weight !== 'number' || deliveryItem.weight <= 0)) {
                        throw new Error('O campo "Pesagem" deve ser um número positivo.');
                    }

                    if (deliveryItem.quantity) {
                        const quantity = Number(deliveryItem.quantity);
                        if (isNaN(quantity) || !Number.isInteger(quantity)) {
                            throw new Error('O campo "Quantidade" deve conter um valor válido.');
                        }
                    }

                    if (deliveryItem.remarks && typeof deliveryItem.remarks !== 'string') {
                        throw new Error('O campo "Observações" deve conter um valor válido.');
                    }
                }
            } catch (error) {
                throw error.message;
            }
        }
    }
}

module.exports = ValidateDeliveryStrategy;

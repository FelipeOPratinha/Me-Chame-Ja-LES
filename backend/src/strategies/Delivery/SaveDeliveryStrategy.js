const sequelize = require("../../config/dbConfig");
const AddressDAO = require('../../daos/AddressDAO');
const DeliveryDAO = require('../../daos/DeliveryDAO');
const DeliveryItemDAO = require('../../daos/DeliveryItemDAO');
const RouteDAO = require('../../daos/RouteDAO');

class SaveDeliveryStrategy {
    static async execute(data) {
        const transaction = await sequelize.transaction();
        const { delivery, routes, deliveryItems } = data;
        try {
            const deliveryObj = await DeliveryDAO.save(delivery, transaction);

            if (routes) await Promise.all(routes.map(async route => {
                const addressObj = await AddressDAO.save(route.address, transaction);
                await RouteDAO.save({
                    order: route.order,
                    deliveryId: deliveryObj.id,
                    addressId: addressObj.id },
                    transaction
                );
            }));

            if (deliveryItems) await Promise.all(deliveryItems.map(async deliveryItem => {
                await DeliveryItemDAO.save({ ...deliveryItem, deliveryId: deliveryObj.id }, transaction);
            }));

            await transaction.commit();
            return { status: 200, message: 'Entrega salva com sucesso!' };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = SaveDeliveryStrategy;

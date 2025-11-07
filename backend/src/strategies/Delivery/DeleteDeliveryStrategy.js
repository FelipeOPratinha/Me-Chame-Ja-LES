const sequelize = require("../../config/dbConfig");
const AddressDAO = require('../../daos/AddressDAO');
const DeliveryDAO = require('../../daos/DeliveryDAO');
const DeliveryItemDAO = require('../../daos/DeliveryItemDAO');
const RouteDAO = require('../../daos/RouteDAO');

class DeleteDeliveryStrategy {
    static async execute(id) {
        const transaction = await sequelize.transaction();
        try {
            let deliveryItems = (await DeliveryItemDAO.findAll(transaction)).map(deliveryItem => deliveryItem.dataValues);
            deliveryItems = deliveryItems.filter(deliveryItem => deliveryItem.deliveryId == id);
            await Promise.all(deliveryItems.map(async deliveryItem => DeliveryItemDAO.delete(deliveryItem.id, transaction)));

            let deliveryRoutes = (await RouteDAO.findAll(transaction)).map(route => route.dataValues);;
            deliveryRoutes = deliveryRoutes.filter(route => route.deliveryId == id);
            await Promise.all(deliveryRoutes.map(async route => {
                await RouteDAO.delete(route.id, transaction);
                await AddressDAO.delete(route.addressId, transaction);
            }));

            await DeliveryDAO.delete(id, transaction);

            await transaction.commit();
            return { status: 200, message: `Entrega ${id} deletada com sucesso!` };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = DeleteDeliveryStrategy;

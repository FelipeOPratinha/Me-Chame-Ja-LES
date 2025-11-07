const sequelize = require("../../config/dbConfig");
const AddressDAO = require('../../daos/AddressDAO');
const DeliveryDAO = require('../../daos/DeliveryDAO');
const DeliveryItemDAO = require('../../daos/DeliveryItemDAO');
const RouteDAO = require('../../daos/RouteDAO');

class GetDeliveriesStrategy {
    static async execute(id = null) {
        const transaction = await sequelize.transaction();
        try {
            let data;

            if (id) {
                const delivery = (await DeliveryDAO.findOne({ id: id }, transaction))?.dataValues;
                const deliveryRoutes = (await RouteDAO.findAll(transaction)).filter(route => route.deliveryId === delivery.id);
                const deliveryRoutesAndAddresses = await Promise.all(deliveryRoutes.map(async route => {
                    const address = (await AddressDAO.findOne({ id: route.addressId }, transaction))?.dataValues;
                    return { order: route.order, address: address }
                }));
                const deliveryItems = (await DeliveryItemDAO.findAll(transaction)).filter(deliveryItem => deliveryItem.deliveryId === delivery.id).map(deliveryItem => deliveryItem.dataValues);

                data = { delivery, routes: deliveryRoutesAndAddresses, deliveryItems };
            }
            else {
                const deliveries = (await DeliveryDAO.findAll(transaction)).map(delivery => delivery.dataValues);;
                data = await Promise.all(deliveries.map(async delivery => {
                    const deliveryRoutes = (await RouteDAO.findAll(transaction)).filter(route => route.deliveryId === delivery.id);
                    const deliveryRoutesAndAddresses = await Promise.all(deliveryRoutes.map(async route => {
                        const address = (await AddressDAO.findOne({ id: route.addressId }, transaction))?.dataValues;
                        return { order: route.order, address: address }
                    }));
                    const deliveryItems = (await DeliveryItemDAO.findAll(transaction)).filter(deliveryItem => deliveryItem.deliveryId === delivery.id).map(deliveryItem => deliveryItem.dataValues);

                    return { delivery, routes: deliveryRoutesAndAddresses, deliveryItems };
                }));
            }

            await transaction.commit();
            return { status: 200, data };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = GetDeliveriesStrategy;

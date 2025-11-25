const TranslateDeliveryObjectStrategy = require('../strategies/Delivery/TranslateDeliveryObjectStrategy');
const ValidateDeliveryStrategy = require('../strategies/Delivery/ValidateDeliveryStrategy');
const SaveDeliveryStrategy = require('../strategies/Delivery/SaveDeliveryStrategy');
const CheckDeliveryIfExistsStrategy = require('../strategies/Delivery/CheckDeliveryIfExistsStrategy');
const ValidateDeliveryForUpdateStrategy = require('../strategies/Delivery/ValidateDeliveryForUpdateStrategy');
const UpdateDeliveryStrategy = require('../strategies/Delivery/UpdateDeliveryStrategy');
const GetDeliveriesStrategy = require('../strategies/Delivery/GetDeliveriesStrategy');
const DeleteDeliveryStrategy = require('../strategies/Delivery/DeleteDeliveryStrategy');
const GetDeliveriesByUserStrategy = require('../strategies/Delivery/GetDeliveriesByUserStrategy');

class DeliveryService {
    static async saveDelivery(delivery) {
        try {
            delivery = await TranslateDeliveryObjectStrategy.execute(delivery, "toEnglish");
            await ValidateDeliveryStrategy.execute(delivery);
            return await SaveDeliveryStrategy.execute(delivery);
        } catch (error) {
            throw error;
        }
    }

    static async updateDelivery(delivery) {
        try {
            delivery = await TranslateDeliveryObjectStrategy.execute(delivery, "toEnglish");
            await CheckDeliveryIfExistsStrategy.execute({ id: delivery.id }, "mustExist");
            await ValidateDeliveryForUpdateStrategy.execute(delivery);
            return await UpdateDeliveryStrategy.execute(delivery);
        } catch (error) {
            throw error;
        }
    }

    static async getDeliveryById(id) {
        try {
            await CheckDeliveryIfExistsStrategy.execute({ id: id }, "mustExist");
            let delivery = await GetDeliveriesStrategy.execute(id);
            delivery.data = await TranslateDeliveryObjectStrategy.execute(delivery.data, "toPortuguese");
            return delivery;
        } catch (error) {
            throw error;
        }
    }

    static async getAllDeliveries() {
        try {
            let deliveries = await GetDeliveriesStrategy.execute();
            deliveries.data = await TranslateDeliveryObjectStrategy.execute(deliveries.data, "toPortuguese");
            return deliveries;
        } catch (error) {
            throw error;
        }
    }

    static async deleteDelivery(delivery) {
        try {
            await CheckDeliveryIfExistsStrategy.execute({ id: delivery.id }, "mustExist");
            return await DeleteDeliveryStrategy.execute(delivery.id);
        } catch (error) {
            throw error;
        }
    }

    static async getDeliveriesByUser(usuario_id) {
        try {
            return await GetDeliveriesByUserStrategy.execute(usuario_id);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = DeliveryService;

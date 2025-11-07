const DeliveryItem = require('../models/deliveryItem');

class DeliveryItemDAO {
    static async save(data, transaction = null) {
        try {
            return await DeliveryItem.create(data, { transaction });
        } catch (error) {
            throw error;
        }
    }

    static async update(data, transaction = null) {
        try {
            const { id, ...fieldsToUpdate } = data;
            return await DeliveryItem.update(fieldsToUpdate, {
                where: { id: id },
                transaction
            });
        } catch (error) {
            throw error;
        }
    }

    static async delete(id, transaction = null) {
        try {
            return await DeliveryItem.destroy({
                where: { id: id },
                transaction
            });
        } catch (error) {
            throw error;
        }
    }

    static async findOne(where, transaction = null) {
        try {
            return await DeliveryItem.findOne({
                where: where,
                transaction
            });
        } catch (error) {
            throw error;
        }
    }

    static async findAll(transaction = null) {
        try {
            return await DeliveryItem.findAll({ transaction });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = DeliveryItemDAO;

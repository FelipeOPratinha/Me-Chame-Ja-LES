const Delivery = require('../models/delivery');

class DeliveryDAO {
    static async save(data, transaction = null) {
        try {
            return await Delivery.create(data, { transaction });
        } catch (error) {
            throw error;
        }
    }

    static async update(data, transaction = null) {
        try {
            const { id, ...fieldsToUpdate } = data;
            return await Delivery.update(fieldsToUpdate, {
                where: { id: id },
                transaction
            });
        } catch (error) {
            throw error;
        }
    }

    static async delete(id, transaction = null) {
        try {
            return await Delivery.destroy({
                where: { id: id },
                transaction
            });
        } catch (error) {
            throw error;
        }
    }

    static async findOne(where, transaction = null) {
        try {
            return await Delivery.findOne({
                where: where,
                transaction
            });
        } catch (error) {
            throw error;
        }
    }

    static async findAll(transaction = null) {
        try {
            return await Delivery.findAll({ transaction });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = DeliveryDAO;

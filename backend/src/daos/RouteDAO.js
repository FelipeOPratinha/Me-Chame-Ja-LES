const Route = require('../models/route');

class RouteDAO {
    static async save(data, transaction = null) {
        try {
            return await Route.create(data, { transaction });
        } catch (error) {
            throw error;
        }
    }

    static async update(data, transaction = null) {
        try {
            const { id, ...fieldsToUpdate } = data;
            return await Route.update(fieldsToUpdate, {
                where: { id: id },
                transaction
            });
        } catch (error) {
            throw error;
        }
    }

    static async delete(id, transaction = null) {
        try {
            return await Route.destroy({
                where: { id: id },
                transaction
            });
        } catch (error) {
            throw error;
        }
    }

    static async findOne(where, transaction = null) {
        try {
            return await Route.findOne({
                where: where,
                transaction
            });
        } catch (error) {
            throw error;
        }
    }

    static async findAll(transaction = null) {
        try {
            return await Route.findAll({ transaction });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RouteDAO;

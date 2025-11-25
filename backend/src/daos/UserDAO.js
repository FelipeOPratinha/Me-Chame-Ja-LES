const User = require('../models/user');

class UserDAO {
    static async save(data, transaction = null) {
        try {
            return await User.create(data, { transaction });
        } catch (error) {
            throw error;
        }
    }

    static async update(data, transaction = null) {
        try {
            const { id, ...fieldsToUpdate } = data;
            return await User.update(fieldsToUpdate, {
                where: { id: id },
                transaction
            });
        } catch (error) {
            throw error;
        }
    }

    static async delete(id, transaction = null) {
        try {
            return await User.update(
            { isActive: 0 },
            {
                where: { id: id },
                transaction
            });
        } catch (error) {
            throw error;
        }
    }

    static async findOne(where, transaction = null) {
        try {
            return await User.findOne({
                where: where,
                transaction
            });
        } catch (error) {
            throw error;
        }
    }

    static async findAll(transaction = null) {
        try {
            return await User.findAll({ transaction });
        } catch (error) {
            throw error;
        }
    }

    static async updateUserToken(id, token, transaction = null) {
        try {
            return await User.update(
                { usuario_fcm_token: token },
                { where: { id: id }, transaction }
            );
        } catch (error) {
            throw error;
        }
    }
}

module.exports = UserDAO;

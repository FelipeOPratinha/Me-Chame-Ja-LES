const ValidateUserStrategy = require('../strategies/User/ValidateUserStrategy');
const CheckUserIfExistsStrategy = require('../strategies/User/CheckUserIfExistsStrategy');
const SaveUserStrategy = require('../strategies/User/SaveUserStrategy');
const UpdateUserStrategy = require('../strategies/User/UpdateUserStrategy');
const GetUsersStrategy = require('../strategies/User/GetUsersStrategy');
const DeleteUserStrategy = require('../strategies/User/DeleteUserStrategy');
const { Op } = require("sequelize");

class UserService {
    static async saveUser(user) {
        try {
            await ValidateUserStrategy.execute(user);
            await CheckUserIfExistsStrategy.execute({ email: user.email }, "mustNotExist");
            return await SaveUserStrategy.execute(user);
        } catch (error) {
            throw error;
        }
    }

    static async updateUser(user) {
        try {
            await CheckUserIfExistsStrategy.execute({ id: user.id }, "mustExist");
            await ValidateUserStrategy.execute(user);
            await CheckUserIfExistsStrategy.execute({ email: user.email, id: { [Op.ne]: user.id } }, "mustNotExist");
            return await UpdateUserStrategy.execute(user);
        } catch (error) {
            throw error;
        }
    }

    static async getUserById(id) {
        try {
            await CheckUserIfExistsStrategy.execute({ id: id }, "mustExist");
            return await GetUsersStrategy.execute(id);
        } catch (error) {
            throw error;
        }
    }

    static async getAllUsers() {
        try {
            return await GetUsersStrategy.execute();
        } catch (error) {
            throw error;
        }
    }

    static async deleteUser(user) {
        try {
            await CheckUserIfExistsStrategy.execute({ id: user.id }, "mustExist");
            return await DeleteUserStrategy.execute(user.id);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = UserService;

const ValidateVehicleStrategy = require('../strategies/Vehicle/ValidateVehicleStrategy');
const SaveVehicleStrategy = require('../strategies/Vehicle/SaveVehicleStrategy');
const CheckVehicleIfExistsStrategy = require('../strategies/Vehicle/CheckVehicleIfExistsStrategy');
const UpdateVehicleStrategy = require('../strategies/Vehicle/UpdateVehicleStrategy');
const GetVehiclesStrategy = require('../strategies/Vehicle/GetVehiclesStrategy');
const DeleteVehicleStrategy = require('../strategies/Vehicle/DeleteVehicleStrategy');
const { Op } = require("sequelize");

class VehicleService {
    static async saveVehicle(vehicle) {
        try {
            await ValidateVehicleStrategy.execute(vehicle);
            await CheckVehicleIfExistsStrategy.execute({ licensePlate: vehicle.licensePlate }, "mustNotExist");
            return await SaveVehicleStrategy.execute(vehicle);
        } catch (error) {
            throw error;
        }
    }

    static async updateVehicle(vehicle) {
        try {
            await CheckVehicleIfExistsStrategy.execute({ id: vehicle.id }, "mustExist");
            await ValidateVehicleStrategy.execute(vehicle);
            await CheckVehicleIfExistsStrategy.execute({ licensePlate: vehicle.licensePlate, id: { [Op.ne]: vehicle.id } }, "mustNotExist");
            return await UpdateVehicleStrategy.execute(vehicle);
        } catch (error) {
            throw error;
        }
    }

    static async getVehicleById(id) {
        try {
            await CheckVehicleIfExistsStrategy.execute({ id: id }, "mustExist");
            return await GetVehiclesStrategy.execute(id);
        } catch (error) {
            throw error;
        }
    }

    static async getAllVehicles() {
        try {
            return await GetVehiclesStrategy.execute();
        } catch (error) {
            throw error;
        }
    }

    static async deleteVehicle(vehicle) {
        try {
            await CheckVehicleIfExistsStrategy.execute({ id: vehicle.id }, "mustExist");
            return await DeleteVehicleStrategy.execute(vehicle.id);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = VehicleService;

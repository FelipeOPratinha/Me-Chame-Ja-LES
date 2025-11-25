const UserDAO = require("../../daos/UserDAO");

class SaveUserTokenStrategy {
    static async execute({ usuario_id, usuario_fcm_token }) {
        try {
            return await UserDAO.updateUserToken(usuario_id, usuario_fcm_token);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = SaveUserTokenStrategy;
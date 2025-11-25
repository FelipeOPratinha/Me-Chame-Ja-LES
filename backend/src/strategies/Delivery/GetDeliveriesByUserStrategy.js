const Delivery = require('../../models/delivery.js');

class GetDeliveriesByUserStrategy {
    static async execute(usuario_id) {
        try {
            const deliveries = await Delivery.findAll({
                where: { solicitante_id: usuario_id },
                order: [["entrega_id", "DESC"]],
            });

            return deliveries;
        } catch (error) {
            throw new Error("Erro ao buscar entregas do usuário: " + error);
        }
    }
}

module.exports = GetDeliveriesByUserStrategy;
const User = require("../models/user");
const Delivery = require("../models/delivery");
const { Op, fn, col, literal } = require("sequelize");
const moment = require("moment");

module.exports = {
    async getDashboardStats(userId) {

        const mesAtual = moment().format("YYYY-MM");

        const user = await User.findByPk(userId);
        if (!user) throw new Error("Usuário não encontrado");

        const filtroUsuario = user.type === "motorista"
            ? { driverId: userId }
            : { requesterId: userId };

        // ===========================
        // CONCLUÍDAS NO MÊS
        // ===========================
        const concluidasMes = await Delivery.count({
            where: {
                ...filtroUsuario,
                status: "concluida"
            }
        });

        const valorMensal = await Delivery.sum("value", {
            where: {
                ...filtroUsuario,
                status: "concluida"
            }
        }) || 0;

        // ===========================
        // PENDENTES E CANCELADAS
        // ===========================
        const pendentes = await Delivery.count({
            where: { ...filtroUsuario, status: "pendente" }
        });

        const canceladas = await Delivery.count({
            where: { ...filtroUsuario, status: "cancelada" }
        });

        // ===========================
        // POR CATEGORIA
        // ===========================
        const categoriasRaw = await Delivery.findAll({
            attributes: [
                ["entrega_tipo_categoria", "categoria"],
                [fn("COUNT", col("entrega_id")), "quantidade"],
            ],
            where: { ...filtroUsuario },
            group: ["entrega_tipo_categoria"]
        });

        const categorias = categoriasRaw.map(c => ({
            categoria: c.dataValues.categoria || "Outro",
            quantidade: Number(c.dataValues.quantidade)
        }));

        // ===========================
        // POR DIA DA SEMANA
        // ===========================
        const semanaRaw = await Delivery.findAll({
            attributes: [
                [literal("DAYNAME(entrega_data_finalizacao)"), "dia"],
                [fn("COUNT", col("entrega_id")), "total"]
            ],
            where: { 
                ...filtroUsuario, 
                status: "concluida" 
            },
            group: [literal("DAYNAME(entrega_data_finalizacao)")]
        });

        const semana = semanaRaw.map(s => ({
            dia: s.dataValues.dia,
            quantidade: Number(s.dataValues.total)
        }));

        // ===========================
        // POR DIA DO MÊS
        // ===========================
        const diasRaw = await Delivery.findAll({
            attributes: [
                [literal("DAY(entrega_data_finalizacao)"), "dia"],
                [fn("COUNT", col("entrega_id")), "total"]
            ],
            where: {
                ...filtroUsuario,
                status: "concluida"
            },
            group: [literal("DAY(entrega_data_finalizacao)")],
            order: [literal("dia ASC")]
        });

        const diasMes = diasRaw.map(d => ({
            dia: d.dataValues.dia,
            quantidade: Number(d.dataValues.total)
        }));

        return {
            usuario: {
                id: user.id,
                nome: user.name,
                tipo: user.type
            },
            fidelidade: {
                total: user.loyaltyPoints
            },
            entregas: {
                concluidasMes,
                valorMensal,
                pendentes,
                canceladas
            },
            graficos: {
                categorias,
                semana,
                diasMes
            }
        };
    }
};
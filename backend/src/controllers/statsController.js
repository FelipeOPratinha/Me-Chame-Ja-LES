const express = require("express");
const router = express.Router();
const StatsService = require("../services/StatsService");

router.get("/dashboard/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await StatsService.getDashboardStats(userId);
        res.status(200).json(result);
    } catch (err) {
        console.error("Erro no Dashboard:", err);
        res.status(500).json({ message: "Erro ao carregar dados do dashboard" });
    }
});

module.exports = router;
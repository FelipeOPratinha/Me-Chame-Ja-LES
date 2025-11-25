const express = require('express');
const router = express.Router();
const DeliveryService = require('../services/DeliveryService');

router.post('/save', async (req, res) => {
    const delivery = req.body;

    try {
        const result = await DeliveryService.saveDelivery(delivery);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: `Erro ao salvar entrega: ${error}`, status: 500 });
    }
});

router.post('/update', async (req, res) => {
    const delivery = req.body;

    try {
        const result = await DeliveryService.updateDelivery(delivery);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: `Erro ao alterar entrega: ${error}`, status: 500 });
    }
});

router.get('/getById', async (req, res) => {
    const id = req.query.id

    try {
        const result = await DeliveryService.getDeliveryById(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: `Erro ao consultar entrega: ${error}`, status: 500 });
    }
});

router.get('/getAll', async (req, res) => {
    try {
        const result = await DeliveryService.getAllDeliveries();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: `Erro ao consultar entregas: ${error}`, status: 500 });
    }
});

router.post('/delete', async (req, res) => {
    const delivery = req.body;

    try {
        const result = await DeliveryService.deleteDelivery(delivery);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: `Erro ao deletar entrega: ${error}`, status: 500 });
    }
});

router.get('/getByUser', async (req, res) => {
    const usuario_id = req.query.usuario_id;

    try {
        const result = await DeliveryService.getDeliveriesByUser(usuario_id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: `Erro ao consultar entregas do usuário: ${error}`, status: 500 });
    }
});

module.exports = router;

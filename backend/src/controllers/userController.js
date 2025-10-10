const express = require('express');
const router = express.Router();
const UserService = require('../services/UserService');

router.post('/login', async (req, res) => {
    const user = req.body;

    try {
        const result = await UserService.validateUser(user);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            message: error.message || 'Erro ao realizar login.',
            success: false
        });
    }
});

router.post('/save', async (req, res) => {
    const user = req.body;

    try {
        const result = await UserService.saveUser(user);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: `Erro ao salvar usuário: ${error}`, status: 500 });
    }
});

router.post('/update', async (req, res) => {
    const user = req.body;

    try {
        const result = await UserService.updateUser(user);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: `Erro ao alterar usuário: ${error}`, status: 500 });
    }
});

router.get('/getById', async (req, res) => {
    const id = req.query.id

    try {
        const result = await UserService.getUserById(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: `Erro ao consultar usuário: ${error}`, status: 500 });
    }
});

router.get('/getAll', async (req, res) => {
    try {
        const result = await UserService.getAllUsers();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: `Erro ao consultar usuários: ${error}`, status: 500 });
    }
});

router.post('/delete', async (req, res) => {
    const user = req.body;

    try {
        const result = await UserService.deleteUser(user);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: `Erro ao deletar usuário: ${error}`, status: 500 });
    }
});

module.exports = router;

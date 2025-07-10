const express = require('express');
const router = express.Router();
const { registrar, login } = require('../controllers/autenticacionController');

// Ruta para registrar usuario
router.post('/registro', registrar);

// Ruta para login
router.post('/login', login);

module.exports = router;
const express = require('express');
const router = express.Router();

// Asegúrate de que el nombre coincida con el archivo del controlador
const { registrar, login } = require('../controllers/usuarioController');

// Ruta para registrar usuario
router.post('/registro', registrar);

// Ruta para login
router.post('/login', login);

module.exports = router;

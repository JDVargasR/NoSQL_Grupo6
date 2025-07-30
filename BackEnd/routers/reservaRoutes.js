const express = require('express');
const router = express.Router();

const { crearReserva } = require('../controllers/reservaController');

// Ruta para crear una reserva
router.post('/crear', crearReserva);

module.exports = router;

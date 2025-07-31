const express = require('express');
const router = express.Router();
const { crearReserva } = require('../controllers/reservaController');

// Ruta POST /api/reservas/crear
router.post('/crear', crearReserva);

module.exports = router;

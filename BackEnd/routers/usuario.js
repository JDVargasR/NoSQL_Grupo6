const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// GET: listar todos los usuarios
router.get('/usuarios', usuarioController.getUsuarios);

// DELETE: eliminar usuario por ID
router.delete('/usuarios/:id', usuarioController.deleteUsuario);

module.exports = router;

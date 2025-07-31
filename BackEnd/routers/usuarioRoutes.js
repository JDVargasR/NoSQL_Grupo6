const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

// Crear usuario
router.post('/', async (req, res) => {
  try {
    const nuevoUsuario = new Usuario(req.body);
    await nuevoUsuario.save();
    res.status(201).json(nuevoUsuario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  const listaUsuarios = await Usuario.find();
  res.json(listaUsuarios);
});

// Obtener usuario por ID personalizado
router.get('/:id', async (req, res) => {
  const usuario = await Usuario.findOne({ id: req.params.id });
  if (usuario) res.json(usuario);
  else res.status(404).json({ error: 'Usuario no encontrado' });
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
  const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (usuario) res.json(usuario);
  else res.status(404).json({ error: 'Usuario no encontrado para actualizar' });
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  const usuario = await Usuario.findOneAndDelete({ id: req.params.id });
  if (usuario) res.status(200).json({ mensaje: 'Usuario eliminado' });
  else res.status(404).json({ error: 'Usuario no encontrado para eliminar' });
});

// Login de usuario (verificación)
router.post('/login', async (req, res) => {
  const { correo, contrasenna } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });

    if (!usuario) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    if (usuario.contrasenna !== contrasenna) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    if (usuario.estado !== 'ACTIVO') {
      return res.status(403).json({ mensaje: 'Usuario inactivo, contacte con su administrador.' });
    }

    res.status(200).json({ usuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

module.exports = router;
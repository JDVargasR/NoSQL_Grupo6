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
  try {
    const listaUsuarios = await Usuario.find();
    res.json(listaUsuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Obtener usuario por ID (¡corregido!)
router.get('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (usuario) res.json(usuario);
    else res.status(404).json({ error: 'Usuario no encontrado' });
  } catch (error) {
    res.status(400).json({ error: 'ID inválido' });
  }
});

// Actualizar usuario (ya estaba bien)
router.put('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (usuario) res.json(usuario);
    else res.status(404).json({ error: 'Usuario no encontrado para actualizar' });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar usuario (¡corregido!)
router.delete('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (usuario) res.status(200).json({ mensaje: 'Usuario eliminado' });
    else res.status(404).json({ error: 'Usuario no encontrado para eliminar' });
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar usuario' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  const { correo, contrasenna } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });

    if (!usuario || usuario.contrasenna !== contrasenna) {
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
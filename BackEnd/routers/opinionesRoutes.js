const express = require('express');
const router = express.Router();
const Opinion = require('../models/Opinion');

// Obtener todas las opiniones
router.get('/', async (req, res) => {
  try {
    const opiniones = await Opinion.find();
    res.json(opiniones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener opiniones' });
  }
});

// Obtener una opinión por ID
router.get('/:id', async (req, res) => {
  try {
    const opinion = await Opinion.findById(req.params.id);
    if (!opinion) {
      return res.status(404).json({ mensaje: 'Opinión no encontrada' });
    }
    res.json(opinion);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar la opinión' });
  }
});

// Crear una nueva opinión
router.post('/', async (req, res) => {
  try {
    const nuevaOpinion = new Opinion(req.body);
    await nuevaOpinion.save();
    res.status(201).json(nuevaOpinion);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al guardar la opinión' });
  }
});

// Actualizar una opinión por ID
router.put('/:id', async (req, res) => {
  try {
    const opinionActualizada = await Opinion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Devuelve la versión actualizada
    );
    if (!opinionActualizada) {
      return res.status(404).json({ mensaje: 'Opinión no encontrada' });
    }
    res.json(opinionActualizada);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar la opinión' });
  }
});

// Eliminar una opinión por ID
router.delete('/:id', async (req, res) => {
  try {
    const opinionEliminada = await Opinion.findByIdAndDelete(req.params.id);
    if (!opinionEliminada) {
      return res.status(404).json({ mensaje: 'Opinión no encontrada' });
    }
    res.json({ mensaje: 'Opinión eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la opinión' });
  }
});

module.exports = router;
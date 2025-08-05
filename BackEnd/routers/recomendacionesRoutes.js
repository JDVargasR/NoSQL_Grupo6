const express = require('express');
const router = express.Router();
const Recomendacion = require('../models/Recomendaciones');

// Crear recomendacion
router.post('/', async (req, res) => {
  try {
    const nuevaRecomendacion = new Recomendacion(req.body);
    await nuevaRecomendacion.save();
    res.status(201).json(nuevaRecomendacion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtener todos las recomendaciones
router.get('/', async (req, res) => {
  try {
    const listaRecomendaciones = await Recomendacion.find();
    res.json(listaRecomendaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las recomendaciones' });
  }
});

// Obtener recomendacion por ID 
router.get('/:id', async (req, res) => {
  try {
    const recomendacion = await Recomendacion.findById(req.params.id);
    if (recomendacion) res.json(recomendacion);
    else res.status(404).json({ error: 'Recomendacion no encontrada' });
  } catch (error) {
    res.status(400).json({ error: 'ID inválido' });
  }
});

// Actualizar Recomendacion 
router.put('/:id', async (req, res) => {
  try {
    const recomendacion = await Recomendacion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (recomendacion) res.json(recomendacion);
    else res.status(404).json({ error: 'Recomendacion no encontrado para actualizar' });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar Recomendacion' });
  }
});

// Eliminar eliminar
router.delete('/:id', async (req, res) => {
  try {
    const recomendacion = await Recomendacion.findByIdAndDelete(req.params.id);
    if (recomendacion) res.status(200).json({ mensaje: 'Recomendacion eliminada' });
    else res.status(404).json({ error: 'La recomendacion no  fue encontrada para eliminar' });
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar recomendacion' });
  }
});

module.exports = router;
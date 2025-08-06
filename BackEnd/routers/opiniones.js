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

// Guardar nueva opinión
router.post('/', async (req, res) => {
  try {
    const nuevaOpinion = new Opinion(req.body);
    await nuevaOpinion.save();
    res.status(201).json(nuevaOpinion);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al guardar la opinión' });
  }
});

module.exports = router;

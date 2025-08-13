const express = require("express");
const router = express.Router();
const Modelo = require("../models/Modelo");

// Crear modelo
router.post("/", async (req, res) => {
  try {
    const nuevoModelo = new Modelo(req.body);
    await nuevoModelo.save();
    res.status(201).json(nuevoModelo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener todos los modelos
router.get("/", async (req, res) => {
  try {
    const modelos = await Modelo.find();
    res.json(modelos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los modelos" });
  }
});

// LISTAR SOLO ACTIVOS
router.get('/activos', async (req, res) => {
  try {
    const modelos = await Modelo.find({ estado: 'ACTIVO' })
      .select('marca modelo anio placa estado') 
      .sort({ marca: 1, modelo: 1, anio: -1 });
    res.json(modelos);
  } catch (e) {
    console.error('Error al listar modelos activos:', e);
    res.status(500).json({ error: 'Error al obtener modelos activos' });
  }
});

// Obtener un modelo por ID
router.get("/:id", async (req, res) => {
  try {
    const modelo = await Modelo.findById(req.params.id);
    if (modelo) res.json(modelo);
    else res.status(404).json({ error: "Modelo no encontrado" });
  } catch (error) {
    res.status(400).json({ error: "ID inválido" });
  }
});

// Actualizar modelo
router.put("/:id", async (req, res) => {
  try {
    const modelo = await Modelo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (modelo) res.json(modelo);
    else res.status(404).json({ error: "Modelo no encontrado para actualizar" });
  } catch (error) {
    res.status(400).json({ error: "Error al actualizar modelo" });
  }
});

// Eliminar modelo
router.delete("/:id", async (req, res) => {
  try {
    const modelo = await Modelo.findByIdAndDelete(req.params.id);
    if (modelo) res.status(200).json({ mensaje: "Modelo eliminado" });
    else res.status(404).json({ error: "Modelo no encontrado para eliminar" });
  } catch (error) {
    res.status(400).json({ error: "Error al eliminar modelo" });
  }
});

module.exports = router;
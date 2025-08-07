const express = require("express");
const router = express.Router();
const Espacio = require("../models/Espacio"); 

// Crear espacio
router.post("/", async (req, res) => {
  try {
    const nuevoEspacio = new Espacio(req.body);
    await nuevoEspacio.save();
    res.status(201).json(nuevoEspacio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener todos los espacios
router.get("/", async (req, res) => {
  try {
    const espacios = await Espacio.find();
    res.json(espacios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los espacios" });
  }
});

// Obtener espacio por ID
router.get("/:id", async (req, res) => {
  try {
    const espacio = await Espacio.findById(req.params.id);
    if (espacio) res.json(espacio);
    else res.status(404).json({ error: "Espacio no encontrado" });
  } catch (error) {
    res.status(400).json({ error: "ID inválido" });
  }
});

// Actualizar espacio
router.put("/:id", async (req, res) => {
  try {
    const espacio = await Espacio.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (espacio) res.json(espacio);
    else res.status(404).json({ error: "Espacio no encontrado para actualizar" });
  } catch (error) {
    res.status(400).json({ error: "Error al actualizar espacio" });
  }
});

// Eliminar espacio
router.delete("/:id", async (req, res) => {
  try {
    const espacio = await Espacio.findByIdAndDelete(req.params.id);
    if (espacio) res.status(200).json({ mensaje: "Espacio eliminado" });
    else res.status(404).json({ error: "Espacio no encontrado para eliminar" });
  } catch (error) {
    res.status(400).json({ error: "Error al eliminar espacio" });
  }
});

module.exports = router;
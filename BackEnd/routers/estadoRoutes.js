const express = require("express");
const router = express.Router();
const Estado = require("../models/Estado");

// --- Crear un nuevo estado (POST) → POST /api/estado
router.post("/", async (req, res) => {
  try {
    const nuevoEstado = new Estado(req.body);
    await nuevoEstado.save();
    res.status(201).json(nuevoEstado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- Obtener todos los estados → GET /api/estado
router.get("/", async (req, res) => {
  try {
    const estados = await Estado.find();
    res.status(200).json(estados);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Obtener un solo estado por ID → GET /api/estado/:id_estado
router.get("/:id_estado", async (req, res) => {
  try {
    const estado = await Estado.findOne({ id_estado: req.params.id_estado });
    if (!estado) {
      return res.status(404).json({ message: "Estado no encontrado" });
    }
    res.status(200).json(estado);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Actualizar un estado por ID → PUT /api/estado/:id_estado
router.put("/:id_estado", async (req, res) => {
  try {
    const estadoActualizado = await Estado.findOneAndUpdate(
      { id_estado: req.params.id_estado },
      req.body,
      { new: true, runValidators: true }
    );
    if (!estadoActualizado) {
      return res.status(404).json({ message: "Estado no encontrado" });
    }
    res.status(200).json(estadoActualizado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- Eliminar un estado por ID → DELETE /api/estado/:id_estado
router.delete("/:id_estado", async (req, res) => {
  try {
    const estadoEliminado = await Estado.findOneAndDelete({
      id_estado: req.params.id_estado,
    });
    if (!estadoEliminado) {
      return res.status(404).json({ message: "Estado no encontrado" });
    }
    res.status(200).json({ message: "Estado eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
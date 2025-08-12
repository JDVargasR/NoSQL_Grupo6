const express = require("express");
const router = express.Router();
const Reserva = require("../models/Reservas");
const Usuario  = require('../models/Usuario');

const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.header('x-usuario-id');
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const user = await Usuario.findById(userId).lean();
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    if (user.estado !== 'ACTIVO') {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }
    if (user.tipo !== 'ADMIN') {
      return res.status(403).json({ error: 'Acceso restringido a ADMIN' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Error de autorización' });
  }
};

// Crear reserva
router.post("/", async (req, res) => {
  try {
    const { id_usuario, id_modelo, id_espacio, estado } = req.body;

    const nuevaReserva = new Reserva({
      id_usuario,
      id_modelo,
      id_espacio,
      estado // debe ser 'INACTIVO', 'ACTIVO' o 'COMPLETADA'
    });

    await nuevaReserva.save();
    res.status(201).json({ mensaje: "Reserva creada exitosamente", reserva: nuevaReserva });
  } catch (error) {
    console.error("Error al crear reserva:", error);
    res.status(500).json({ error: "Error al registrar la reserva" });
  }
});

// Obtener reservas pendientes (estado INACTIVO)
router.get('/pendientes', requireAdmin, async (req, res) => {
  try {
    const reservas = await Reserva.find({ estado: 'INACTIVO' })
      .populate('id_usuario', 'nombre correo')
      .populate('id_modelo', 'marca modelo anio')
      .populate('id_espacio', 'numero_espacio estado')
      .sort({ fecha: -1 });

    res.json(reservas);
  } catch (error) {
    console.error("Error al obtener reservas pendientes:", error);
    res.status(500).json({ error: 'Error al obtener las reservas pendientes' });
  }
});

// Solo permite confirmar si está INACTIVO
router.patch('/:id/confirmar', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const reserva = await Reserva.findById(id);

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    if (reserva.estado !== 'INACTIVO') {
      return res.status(400).json({ error: 'Solo se pueden confirmar reservas pendientes' });
    }

    reserva.estado = 'ACTIVO';
    // Si quieres guardar cuándo se activó:
    if (!reserva.fecha_activacion) {
      reserva.fecha_activacion = new Date();
    }

    await reserva.save();

    return res.json({ ok: true, mensaje: 'Reserva confirmada', reserva });
  } catch (error) {
    console.error("Error al confirmar reserva:", error);
    res.status(500).json({ error: 'Error al confirmar la reserva' });
  }
});

// ACTIVAS: solo ADMIN
router.get('/activas', requireAdmin, async (req, res) => {
  try {
    const reservas = await Reserva.find({ estado: 'ACTIVO' })
      .populate('id_usuario', 'nombre correo')
      .populate('id_modelo', 'marca modelo anio')
      .populate('id_espacio', 'numero_espacio estado')
      .sort({ fecha: -1 });

    res.json(reservas);
  } catch (error) {
    console.error("Error al obtener reservas activas:", error);
    res.status(500).json({ error: 'Error al obtener las reservas activas' });
  }
});

// COMPLETADA: solo ADMIN
router.patch('/:id/completar', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const reserva = await Reserva.findById(id);

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    if (reserva.estado !== 'ACTIVO') {
      return res.status(400).json({ error: 'Solo se pueden completar reservas ACTIVAS' });
    }

    reserva.estado = 'COMPLETADA';
    if (!reserva.fecha_completada) {
      reserva.fecha_completada = new Date();
    }

    await reserva.save();
    return res.json({ ok: true, mensaje: 'Reserva completada', reserva });
  } catch (error) {
    console.error("Error al completar reserva:", error);
    res.status(500).json({ error: 'Error al completar la reserva' });
  }
});

// Obtener una reserva por ID
router.get("/:id", async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id)
      .populate("id_usuario", "nombre correo")
      .populate("id_modelo", "marca modelo anio")
      .populate("id_espacio", "numero tipo");

    if (!reserva) {
      console.error("Error al obtener reservas pendientes:", error);
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    res.json(reserva);
  } catch (error) {
    console.error("Error al buscar reserva:", error);
    res.status(400).json({ error: "ID inválido" });
  }
});

// Actualizar reserva por ID
router.put("/:id", async (req, res) => {
  try {
    const { id_usuario, id_modelo, id_espacio, estado } = req.body;

    const reservaActualizada = await Reserva.findByIdAndUpdate(
      req.params.id,
      { id_usuario, id_modelo, id_espacio, estado },
      { new: true }
    );

    if (!reservaActualizada) {
      return res.status(404).json({ error: "Reserva no encontrada para actualizar" });
    }

    res.json({ mensaje: "Reserva actualizada", reserva: reservaActualizada });
  } catch (error) {
    console.error("Error al actualizar reserva:", error);
    res.status(400).json({ error: "Error al actualizar la reserva" });
  }
});

// Eliminar reserva por ID
router.delete("/:id", async (req, res) => {
  try {
    const reservaEliminada = await Reserva.findByIdAndDelete(req.params.id);

    if (!reservaEliminada) {
      return res.status(404).json({ error: "Reserva no encontrada para eliminar" });
    }

    res.json({ mensaje: "Reserva eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar reserva:", error);
    res.status(400).json({ error: "Error al eliminar la reserva" });
  }
});

module.exports = router;
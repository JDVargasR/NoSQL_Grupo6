const express = require("express");
const router = express.Router();
const Reserva = require("../models/Reservas");
const Usuario = require("../models/Usuario");

// --- auth: solo ADMIN activo ---
const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.header("x-usuario-id");
    if (!userId) return res.status(401).json({ error: "No autenticado" });

    const user = await Usuario.findById(userId).lean();
    if (!user) return res.status(401).json({ error: "Usuario no encontrado" });
    if (user.estado !== "ACTIVO") return res.status(403).json({ error: "Usuario inactivo" });
    if (user.tipo !== "ADMIN") return res.status(403).json({ error: "Acceso restringido a ADMIN" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ error: "Error de autorización" });
  }
};

// --- validar ObjectId (sin regex en la ruta) ---
const isObjectId = (s) => typeof s === "string" && /^[0-9a-fA-F]{24}$/.test(s);
const validateId = (req, res, next) => {
  if (!isObjectId(req.params.id)) return res.status(400).json({ error: "ID inválido" });
  next();
};

// ================== RUTAS ==================

// Crear reserva (p.ej. desde el cliente)
router.post("/", async (req, res) => {
  try {
    const { id_usuario, id_modelo, id_espacio, estado } = req.body;
    const nuevaReserva = new Reserva({ id_usuario, id_modelo, id_espacio, estado });
    await nuevaReserva.save();
    res.status(201).json({ mensaje: "Reserva creada exitosamente", reserva: nuevaReserva });
  } catch (error) {
    console.error("Error al crear reserva:", error);
    res.status(500).json({ error: "Error al registrar la reserva" });
  }
});

/* ===== RUTAS FIJAS (deben ir ANTES de cualquier "/:id") ===== */

// PENDIENTES (INACTIVO)
router.get("/pendientes", requireAdmin, async (_req, res) => {
  try {
    const reservas = await Reserva.find({ estado: "INACTIVO" })
      .populate("id_usuario", "nombre correo")
      .populate("id_modelo", "marca modelo anio")
      .populate("id_espacio", "numero_espacio estado")
      .sort({ fecha: -1 });
    res.json(reservas);
  } catch (error) {
    console.error("Error al obtener reservas pendientes:", error);
    res.status(500).json({ error: "Error al obtener las reservas pendientes" });
  }
});

// ACTIVAS
router.get("/activas", requireAdmin, async (_req, res) => {
  try {
    const reservas = await Reserva.find({ estado: "ACTIVO" })
      .populate("id_usuario", "nombre correo")
      .populate("id_modelo", "marca modelo anio")
      .populate("id_espacio", "numero_espacio estado")
      .sort({ fecha: -1 });
    res.json(reservas);
  } catch (error) {
    console.error("Error al obtener reservas activas:", error);
    res.status(500).json({ error: "Error al obtener las reservas activas" });
  }
});

// COMPLETADAS
router.get("/completadas", requireAdmin, async (_req, res) => {
  try {
    const reservas = await Reserva.find({ estado: "COMPLETADA" })
      .populate("id_usuario", "nombre correo")
      .populate("id_modelo", "marca modelo anio")
      .populate("id_espacio", "numero_espacio estado")
      .sort({ fecha_completada: -1, fecha: -1 });
  res.json(reservas);
  } catch (error) {
    console.error("Error al obtener reservas completadas:", error);
    res.status(500).json({ error: "Error al obtener las reservas completadas" });
  }
});

/* ===== RUTAS CON :id (sin regex, pero validamos con middleware) ===== */

// Confirmar (INACTIVO -> ACTIVO)
router.patch("/:id/confirmar", requireAdmin, validateId, async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id);
    if (!reserva) return res.status(404).json({ error: "Reserva no encontrada" });
    if (reserva.estado !== "INACTIVO") {
      return res.status(400).json({ error: "Solo se pueden confirmar reservas pendientes" });
    }
    reserva.estado = "ACTIVO";
    if (!reserva.fecha_activacion) reserva.fecha_activacion = new Date();
    await reserva.save();
    res.json({ ok: true, mensaje: "Reserva confirmada", reserva });
  } catch (error) {
    console.error("Error al confirmar reserva:", error);
    res.status(500).json({ error: "Error al confirmar la reserva" });
  }
});

// Completar (ACTIVO -> COMPLETADA)
router.patch("/:id/completar", requireAdmin, validateId, async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id);
    if (!reserva) return res.status(404).json({ error: "Reserva no encontrada" });
    if (reserva.estado !== "ACTIVO") {
      return res.status(400).json({ error: "Solo se pueden completar reservas ACTIVAS" });
    }
    reserva.estado = "COMPLETADA";
    if (!reserva.fecha_completada) reserva.fecha_completada = new Date();
    await reserva.save();
    res.json({ ok: true, mensaje: "Reserva completada", reserva });
  } catch (error) {
    console.error("Error al completar reserva:", error);
    res.status(500).json({ error: "Error al completar la reserva" });
  }
});

// Obtener una reserva por ID (solo admin; ajusta si quieres público)
router.get("/:id", requireAdmin, validateId, async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id)
      .populate("id_usuario", "nombre correo")
      .populate("id_modelo", "marca modelo anio")
      .populate("id_espacio", "numero_espacio estado");
    if (!reserva) return res.status(404).json({ error: "Reserva no encontrada" });
    res.json(reserva);
  } catch (error) {
    console.error("Error al buscar reserva:", error);
    res.status(400).json({ error: "ID inválido" });
  }
});

// Actualizar reserva por ID
router.put("/:id", requireAdmin, validateId, async (req, res) => {
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

// Eliminar reserva por ID (solo ADMIN) — permite INACTIVO o COMPLETADA
router.delete("/:id", requireAdmin, validateId, async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id).lean();
    if (!reserva) return res.status(404).json({ error: "Reserva no encontrada para eliminar" });
    if (!["INACTIVO", "COMPLETADA"].includes(reserva.estado)) {
      return res.status(400).json({ error: "Solo se pueden eliminar reservas pendientes o completadas" });
    }
    await Reserva.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Reserva eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar reserva:", error);
    res.status(400).json({ error: "Error al eliminar la reserva" });
  }
});

module.exports = router;
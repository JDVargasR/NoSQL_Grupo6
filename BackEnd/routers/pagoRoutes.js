const express = require('express');
const router = express.Router();

const Pago = require('../models/Pago');
const Usuario = require('../models/Usuario');

// --- Middleware: solo ADMIN activo ---
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
    console.error('Auth error (pagoRoutes):', err);
    res.status(500).json({ error: 'Error de autorización' });
  }
};

// --- Utilidades de validación ---
const TIPOS_PERMITIDOS = ['EFECTIVO', 'SINPEMOVIL', 'TARJETA'];
const ESTADOS_PERMITIDOS = ['COMPLETADO', 'PENDIENTE', 'CON ERROR'];

// POST /api/pagos  -> Crear pago (ADMIN)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { monto_pago, tipo_pago, id_descuento, estado } = req.body || {};

    // monto
    const monto = Number(monto_pago);
    if (!Number.isFinite(monto) || monto <= 0) {
      return res.status(400).json({ error: 'monto_pago debe ser un número > 0' });
    }

    // tipo
    if (!TIPOS_PERMITIDOS.includes(String(tipo_pago))) {
      return res.status(400).json({ error: 'tipo_pago inválido' });
    }

    // descuento (por defecto es 0)
    const desc = (id_descuento === null || id_descuento === undefined || id_descuento === '')
      ? 0
      : Number(id_descuento);
    if (!Number.isFinite(desc) || desc < 0) {
      return res.status(400).json({ error: 'id_descuento debe ser un número ≥ 0' });
    }

    // estado (por defecto el modelo usa COMPLETADO)
    let estadoPago = estado;
    if (estadoPago !== undefined) {
      if (!ESTADOS_PERMITIDOS.includes(String(estadoPago))) {
        return res.status(400).json({ error: 'estado de pago inválido' });
      }
    }

    const pago = new Pago({
      monto_pago: monto,
      tipo_pago: String(tipo_pago),
      id_descuento: desc,
      ...(estadoPago ? { estado: String(estadoPago) } : {}) 
    });

    const guardado = await pago.save();
    return res.status(201).json({ ok: true, pago: guardado });
  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json({ error: 'Error al crear el pago' });
  }
});

// GET /api/pagos -> Lista de pagos (ADMIN)
router.get('/', requireAdmin, async (_req, res) => {
  try {
    const pagos = await Pago.find().sort({ _id: -1 }).lean();
    res.json(pagos);
  } catch (error) {
    console.error('Error al listar pagos:', error);
    res.status(500).json({ error: 'Error al obtener los pagos' });
  }
});


// GET /api/pagos/:id -> Pago por id (ADMIN)
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pago = await Pago.findById(id).lean();
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json(pago);
  } catch (error) {
    console.error('Error al obtener pago:', error);
    res.status(500).json({ error: 'Error al obtener el pago' });
  }
});

// DELETE /api/pagos/:id -> Eliminar pago (ADMIN)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pago = await Pago.findByIdAndDelete(id);
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json({ ok: true, mensaje: 'Pago eliminado' });
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    res.status(500).json({ error: 'Error al eliminar el pago' });
  }
});

module.exports = router;
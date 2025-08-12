
const mongoose = require("mongoose");

const pagoSchema = new mongoose.Schema({
  monto_pago: { type: Number, required: true },
  tipo_pago: { type: String, enum: ['EFECTIVO', 'SINPEMOVIL', 'TARJETA'], default: 'EFECTIVO' },
  estado: { type: String, enum: ['COMPLETADO', 'PENDIENTE', 'CON ERROR'], default: 'COMPLETADO' },
  id_descuento: { type: Number, required: true }
});

module.exports = mongoose.model("Pago", pagoSchema);


const mongoose = require("mongoose");

const facturaSchema = new mongoose.Schema({
  id_factura: { type: Number, required: true, unique: true },
  id_tarifa: { type: Number, required: true, ref: "Tarifa" },
  id_espacio: { type: Number, required: true, ref: "Espacio" },
  id_usuario: { type: Number, required: true, ref: "Usuario" },
  id_pago: { type: Number, required: true, ref: "Pago" },
  monto_total: { type: Number, required: true }
});

module.exports = mongoose.model("Factura", facturaSchema);

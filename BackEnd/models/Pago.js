
const mongoose = require("mongoose");

const pagoSchema = new mongoose.Schema({
  id_pago: { type: Number, required: true, unique: true },
  monto_pago: { type: Number, required: true },
  id_metodo_pago: { type: Number, required: true, ref: "MetodoPago" },
  id_estado: { type: Number, required: true, ref: "Estado" },
  id_descuento: { type: Number, required: true }
});

module.exports = mongoose.model("Pago", pagoSchema);

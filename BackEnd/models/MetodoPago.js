
const mongoose = require("mongoose");

const metodoPagoSchema = new mongoose.Schema({
  id_metodo_pago: { type: Number, required: true, unique: true },
  tipo_metodo_pago: { type: String, required: true, maxlength: 50 },
  id_estado: { type: Number, required: true, ref: "Estado" }
});

module.exports = mongoose.model("MetodoPago", metodoPagoSchema);

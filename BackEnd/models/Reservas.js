
const mongoose = require("mongoose");

const reservaSchema = new mongoose.Schema({
  id_reserva: { type: Number, required: true, unique: true },
  id_usuario: { type: Number, required: true, ref: "Usuario" },
  id_espacio: { type: Number, required: true, ref: "Espacio" },
  id_estado: { type: Number, required: true, ref: "Estado" },
  monto_total: { type: Number, required: true }
});

module.exports = mongoose.model("Reservas", reservaSchema);

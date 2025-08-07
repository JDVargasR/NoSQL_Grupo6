const mongoose = require("mongoose");

const reservaSchema = new mongoose.Schema({
  id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  id_modelo: { type: mongoose.Schema.Types.ObjectId, ref: "Modelo", required: true },
  id_espacio: { type: mongoose.Schema.Types.ObjectId, ref: "Espacio", required: true },
  estado: { type: String, enum: ['ACTIVO', 'INACTIVO', 'COMPLETADA'], default: 'INACTIVO' },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Reserva", reservaSchema);
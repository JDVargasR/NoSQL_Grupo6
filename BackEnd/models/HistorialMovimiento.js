
const mongoose = require("mongoose");

const historialSchema = new mongoose.Schema({
  id_movimiento: { type: Number, required: true, unique: true },
  id_vehiculo: { type: Number, required: true, ref: "Vehiculo" },
  tipo_movimiento: {
    type: String,
    enum: ["Ingreso", "Salida"],
    required: true
  },
  fecha_hora: { type: Date, required: true }
});

module.exports = mongoose.model("HistorialMovimiento", historialSchema);

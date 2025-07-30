
const mongoose = require("mongoose");

const tarifaSchema = new mongoose.Schema({
  id_tarifa: { type: Number, required: true, unique: true },
  id_espacio: { type: Number, required: true, ref: "Espacio" },
  costo_hora: { type: Number, required: true }
});

module.exports = mongoose.model("Tarifa", tarifaSchema);

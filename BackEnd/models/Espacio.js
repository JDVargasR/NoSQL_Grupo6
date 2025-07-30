
const mongoose = require("mongoose");

const espacioSchema = new mongoose.Schema({
  id_espacio: { type: Number, required: true, unique: true },
  numero_espacio: { type: Number, required: true },
  id_estado: { type: Number, required: true, ref: "Estado" },
  cantidad_horas: { type: Number, required: true }
});

module.exports = mongoose.model("Espacio", espacioSchema);

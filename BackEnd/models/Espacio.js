const mongoose = require("mongoose");

const espacioSchema = new mongoose.Schema({
  numero_espacio: { type: Number, required: true },
  estado: { type: String, enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' }
});

module.exports = mongoose.model("Espacio", espacioSchema);

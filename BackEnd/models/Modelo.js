const mongoose = require("mongoose");

const modeloSchema = new mongoose.Schema({
  marca: { type: String, required: true, maxlength: 50 },
  modelo: { type: String, required: true, maxlength: 50 },
  anio: { type: Number, required: true },
  estado: { type: String, enum: ["ACTIVO", "INACTIVO"], default: "ACTIVO" }
});

module.exports = mongoose.model("Modelo", modeloSchema);
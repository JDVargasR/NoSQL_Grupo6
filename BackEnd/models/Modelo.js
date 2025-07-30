
const mongoose = require("mongoose");

const modeloSchema = new mongoose.Schema({
  id_modelo: { type: Number, required: true, unique: true },
  modelo: { type: String, required: true, maxlength: 50 },
  anio: { type: Number, required: true },
  id_estado: { type: Number, required: true, ref: "Estado" }
});

module.exports = mongoose.model("Modelo", modeloSchema);

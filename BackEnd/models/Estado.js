
const mongoose = require("mongoose");

const estadoSchema = new mongoose.Schema({
  id_estado: { type: Number, required: true, unique: true },
  tipo_estado: { type: String, required: true, maxlength: 30 }
});

module.exports = mongoose.model("Estado", estadoSchema);

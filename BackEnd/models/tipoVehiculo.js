
const mongoose = require("mongoose");

const vehiculoSchema = new mongoose.Schema({
  tipo_vehiculo: { type: Number, required: true, unique: true },
  id_estado: { type: Number, required: true, ref: "Estado" },
});

module.exports = mongoose.model("Vehiculo", vehiculoSchema);
